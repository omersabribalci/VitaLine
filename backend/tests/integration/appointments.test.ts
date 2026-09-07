import request from "supertest";
import { addDays, format, getDay, startOfDay } from "date-fns";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import app from "../../dist/src/app.js";
import type {
  AppointmentDocumentShape,
  BookingPolicyDocumentShape,
  DoctorDocumentShape,
  PatientDocumentShape,
  UserDocumentShape,
} from "../../src/types";

const User = mongoose.model<UserDocumentShape>("User");
const Doctor = mongoose.model<DoctorDocumentShape>("Doctor");
const Patient = mongoose.model<PatientDocumentShape>("Patient");
const Appointment = mongoose.model<AppointmentDocumentShape>("Appointment");
const BookingPolicy =
  mongoose.model<BookingPolicyDocumentShape>("BookingPolicy");

const findNextWeekday = (wantedDay: number): Date => {
  let candidate = startOfDay(addDays(new Date(), 1));

  while (getDay(candidate) !== wantedDay) {
    candidate = addDays(candidate, 1);
  }

  return candidate;
};

const createDoctor = async () => {
  const user = await User.create({
    name: "Test Doctor",
    email: "availability-doctor@test.com",
    password: "Strong123",
    phone: "05555555555",
    role: "doctor",
  });
  const doctor = await Doctor.create({
    userId: user._id,
    title: "Dr.",
    speciality: "Cardiology",
    unavailableDates: [],
  });
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" },
  );

  return { doctor, token };
};

const createPatient = async (suffix = "one") => {
  const user = await User.create({
    name: "Test Patient",
    email: `availability-patient-${suffix}@test.com`,
    password: "Strong123",
    phone: suffix === "one" ? "05555555556" : "05555555557",
    role: "patient",
  });
  const patient = await Patient.create({ userId: user._id });
  const token = jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" },
  );

  return { patient, token, user };
};

const createPolicy = () =>
  BookingPolicy.create({
    appointmentDurationMinutes: 30,
    bookingWindowDays: 30,
    workingTimeStart: "09:00",
    workingTimeEnd: "11:00",
    workingDays: [1, 2, 3, 4, 5],
    lunchBreakStart: "10:00",
    lunchBreakEnd: "10:30",
  });

const createAdminToken = async () => {
  const user = await User.create({
    name: "Test Admin",
    email: "appointment-admin@test.com",
    password: "Strong123",
    phone: "05555555558",
    role: "admin",
  });

  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" },
  );
};

describe("appointment availability API", () => {
  it("uses policy hours, lunch break and existing appointments to build slots", async () => {
    const { doctor, token } = await createDoctor();
    const { patient } = await createPatient();
    await createPolicy();
    const targetDate = findNextWeekday(1);
    const date = format(targetDate, "yyyy-MM-dd");

    await Appointment.create({
      doctorId: doctor._id,
      patientId: patient._id,
      dateAndTime: new Date(`${date}T09:30:00`),
    });

    const response = await request(app)
      .get("/api/appointments/availability")
      .query({ doctorId: doctor._id.toString(), date })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      date,
      doctorId: doctor._id.toString(),
      slots: [
        { time: "09:00", isAvailable: true },
        { time: "09:30", isAvailable: false },
        { time: "10:30", isAvailable: true },
      ],
    });
  });

  it("returns no slots on a non-working day", async () => {
    const { doctor, token } = await createDoctor();
    await createPolicy();
    const saturday = format(findNextWeekday(6), "yyyy-MM-dd");

    const response = await request(app)
      .get("/api/appointments/availability")
      .query({ doctorId: doctor._id.toString(), date: saturday })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.slots).toEqual([]);
  });

  it("returns no slots while the doctor is on holiday", async () => {
    const { doctor, token } = await createDoctor();
    await createPolicy();
    const holidayDate = findNextWeekday(2);
    const date = format(holidayDate, "yyyy-MM-dd");
    doctor.unavailableDates = [{ start: holidayDate, end: holidayDate }];
    await doctor.save();

    const response = await request(app)
      .get("/api/appointments/availability")
      .query({ doctorId: doctor._id.toString(), date })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.slots).toEqual([]);
  });

  it("uses the authenticated patient's profile instead of a supplied patientId", async () => {
    const { doctor } = await createDoctor();
    const authenticatedPatient = await createPatient("one");
    const otherPatient = await createPatient("two");
    await createPolicy();
    const date = format(findNextWeekday(1), "yyyy-MM-dd");

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${authenticatedPatient.token}`)
      .send({
        doctorId: doctor._id.toString(),
        patientId: otherPatient.patient._id.toString(),
        dateAndTime: `${date}T09:00:00`,
      });

    expect(response.status).toBe(201);
    const storedAppointment = await Appointment.findById(
      response.body.data._id,
    ).lean();
    expect(storedAppointment?.patientId.toString()).toBe(
      authenticatedPatient.patient._id.toString(),
    );
    expect(storedAppointment?.patientId.toString()).not.toBe(
      otherPatient.patient._id.toString(),
    );
  });

  it("rejects a second patient when the doctor's slot is already booked", async () => {
    const { doctor } = await createDoctor();
    const firstPatient = await createPatient("one");
    const secondPatient = await createPatient("two");
    await createPolicy();
    const date = format(findNextWeekday(2), "yyyy-MM-dd");
    const appointmentData = {
      doctorId: doctor._id.toString(),
      dateAndTime: `${date}T09:00:00`,
    };

    const firstResponse = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${firstPatient.token}`)
      .send(appointmentData);
    const secondResponse = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${secondPatient.token}`)
      .send(appointmentData);

    expect(firstResponse.status).toBe(201);
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.message).toBe(
      "This time slot is already booked for the selected doctor.",
    );
    expect(await Appointment.countDocuments()).toBe(1);
  });

  it("rejects appointment creation on a backend non-working day", async () => {
    const { doctor } = await createDoctor();
    const { token } = await createPatient();
    await createPolicy();
    const saturday = format(findNextWeekday(6), "yyyy-MM-dd");

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        doctorId: doctor._id.toString(),
        dateAndTime: `${saturday}T09:00:00`,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Appointments cannot be booked on non-working days.",
    );
    expect(await Appointment.countDocuments()).toBe(0);
  });

  it("allows a patient to cancel their own appointment", async () => {
    const { doctor } = await createDoctor();
    const { patient, token } = await createPatient();
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: patient._id,
      dateAndTime: findNextWeekday(1).setHours(9, 0, 0, 0),
    });

    const response = await request(app)
      .patch(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "cancelled" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("cancelled");
  });

  it("prevents a patient from rescheduling or editing another patient's appointment", async () => {
    const { doctor } = await createDoctor();
    const owner = await createPatient("one");
    const otherPatient = await createPatient("two");
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: owner.patient._id,
      dateAndTime: findNextWeekday(1).setHours(9, 0, 0, 0),
    });

    const rescheduleResponse = await request(app)
      .patch(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ dateAndTime: `${format(findNextWeekday(2), "yyyy-MM-dd")}T09:00:00` });
    const ownershipResponse = await request(app)
      .patch(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${otherPatient.token}`)
      .send({ status: "cancelled" });

    expect(rescheduleResponse.status).toBe(403);
    expect(rescheduleResponse.body.message).toBe(
      "Patients can only cancel their own appointments.",
    );
    expect(ownershipResponse.status).toBe(404);
    expect(ownershipResponse.body.message).toBe("Appointment not found.");
  });

  it("allows a doctor to update only the status of their own appointment", async () => {
    const { doctor, token } = await createDoctor();
    const { patient } = await createPatient();
    await createPolicy();
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: patient._id,
      dateAndTime: findNextWeekday(1).setHours(9, 0, 0, 0),
    });

    const statusResponse = await request(app)
      .patch(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });
    const forbiddenResponse = await request(app)
      .patch(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ dateAndTime: `${format(findNextWeekday(2), "yyyy-MM-dd")}T09:00:00` });

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.status).toBe("completed");
    expect(forbiddenResponse.status).toBe(403);
    expect(forbiddenResponse.body.message).toBe(
      "Doctors can only update appointment status.",
    );
  });

  it("allows an admin to reschedule an appointment", async () => {
    const { doctor } = await createDoctor();
    const { patient } = await createPatient();
    const adminToken = await createAdminToken();
    await createPolicy();
    const appointment = await Appointment.create({
      doctorId: doctor._id,
      patientId: patient._id,
      dateAndTime: findNextWeekday(1).setHours(9, 0, 0, 0),
    });
    const newDate = format(findNextWeekday(2), "yyyy-MM-dd");

    const response = await request(app)
      .patch(`/api/appointments/${appointment._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ dateAndTime: `${newDate}T09:00:00` });

    expect(response.status).toBe(200);
    expect(format(new Date(response.body.data.dateAndTime), "yyyy-MM-dd")).toBe(
      newDate,
    );
  });

  it("returns correctly grouped appointment statistics to an admin", async () => {
    const { doctor } = await createDoctor();
    const { patient } = await createPatient();
    const adminToken = await createAdminToken();
    await Appointment.create([
      {
        doctorId: doctor._id,
        patientId: patient._id,
        dateAndTime: new Date(Date.now() + 86_400_000),
        status: "scheduled",
      },
      {
        doctorId: doctor._id,
        patientId: patient._id,
        dateAndTime: new Date(Date.now() + 172_800_000),
        status: "cancelled",
      },
    ]);

    const response = await request(app)
      .get("/api/appointments/statistics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      doctorCount: 1,
      patientCount: 1,
      appointmentCount: 2,
      statusCounts: { scheduled: 1, cancelled: 1, completed: 0 },
      appointmentsByDoctor: [
        {
          doctorId: doctor._id.toString(),
          doctorName: "Dr. Test Doctor",
          count: 2,
        },
      ],
      appointmentsBySpeciality: [{ speciality: "Cardiology", count: 2 }],
    });
  });
});
