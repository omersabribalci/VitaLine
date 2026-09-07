import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../dist/src/app.js";
import type {
  AppointmentDocumentShape,
  DoctorDocumentShape,
  PatientDocumentShape,
  UserDocumentShape,
} from "../../src/types";

const User = mongoose.model<UserDocumentShape>("User");
const Doctor = mongoose.model<DoctorDocumentShape>("Doctor");
const Patient = mongoose.model<PatientDocumentShape>("Patient");
const Appointment = mongoose.model<AppointmentDocumentShape>("Appointment");

const signToken = (user: {
  _id: { toString(): string };
  email: string;
  role: string;
}) =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" },
  );

const createAdmin = async () => {
  const user = await User.create({
    name: "Test Admin",
    email: "admin-management@test.com",
    password: "Strong123",
    phone: "05555555550",
    role: "admin",
  });
  return { user, token: signToken(user) };
};

const createDoctor = async (suffix = "one") => {
  const user = await User.create({
    name: `Doctor ${suffix}`,
    email: `doctor-${suffix}@test.com`,
    password: "Strong123",
    phone: suffix === "one" ? "05555555551" : "05555555552",
    role: "doctor",
  });
  const doctor = await Doctor.create({
    userId: user._id,
    title: "Dr.",
    speciality: "Cardiology",
  });
  return { user, doctor, token: signToken(user) };
};

const createPatient = async () => {
  const user = await User.create({
    name: "Test Patient",
    email: "patient-management@test.com",
    password: "Strong123",
    phone: "05555555553",
    role: "patient",
  });
  const patient = await Patient.create({ userId: user._id });
  return { user, patient, token: signToken(user) };
};

describe("doctor and patient management API", () => {
  it("allows only an admin to create a doctor", async () => {
    const { token: adminToken } = await createAdmin();
    const patientAccount = await createPatient();
    const body = {
      name: "Created Doctor",
      email: "created-doctor@test.com",
      phone: "05555555554",
      password: "Strong123",
      title: "Dr.",
      speciality: "Neurology",
    };

    const forbiddenResponse = await request(app)
      .post("/api/doctors")
      .set("Authorization", `Bearer ${patientAccount.token}`)
      .send(body);
    const adminResponse = await request(app)
      .post("/api/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(body);

    expect(forbiddenResponse.status).toBe(403);
    expect(adminResponse.status).toBe(201);
    expect(adminResponse.body.data).toMatchObject({
      user: { email: body.email, role: "doctor" },
      doctor: { title: "Dr.", speciality: "Neurology" },
    });
    expect(adminResponse.body.data.user).not.toHaveProperty("password");
  });

  it("allows a doctor to update only their own profile", async () => {
    const firstDoctor = await createDoctor("one");
    const secondDoctor = await createDoctor("two");

    const ownResponse = await request(app)
      .patch(`/api/doctors/${firstDoctor.doctor._id}`)
      .set("Authorization", `Bearer ${firstDoctor.token}`)
      .send({ speciality: "Neurology" });
    const otherResponse = await request(app)
      .patch(`/api/doctors/${secondDoctor.doctor._id}`)
      .set("Authorization", `Bearer ${firstDoctor.token}`)
      .send({ speciality: "Neurology" });

    expect(ownResponse.status).toBe(200);
    expect(ownResponse.body.data.speciality).toBe("Neurology");
    expect(otherResponse.status).toBe(403);
    expect(otherResponse.body.message).toBe(
      "You can only update your own profile.",
    );
  });

  it("soft-deletes a doctor and cancels scheduled appointments", async () => {
    const { token: adminToken } = await createAdmin();
    const doctorAccount = await createDoctor();
    const patientAccount = await createPatient();
    const appointment = await Appointment.create({
      doctorId: doctorAccount.doctor._id,
      patientId: patientAccount.patient._id,
      dateAndTime: new Date(Date.now() + 86_400_000),
    });

    const response = await request(app)
      .delete(`/api/doctors/${doctorAccount.doctor._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    const rawDoctor = await Doctor.collection.findOne({
      _id: doctorAccount.doctor._id,
    });
    const rawUser = await User.collection.findOne({ _id: doctorAccount.user._id });
    const updatedAppointment = await Appointment.findById(appointment._id).lean();
    expect(rawDoctor?.isDeleted).toBe(true);
    expect(rawUser?.isDeleted).toBe(true);
    expect(updatedAppointment?.status).toBe("cancelled");
  });

  it("blocks a disabled patient from authenticated endpoints", async () => {
    const { token: adminToken } = await createAdmin();
    const patientAccount = await createPatient();

    const updateResponse = await request(app)
      .patch(`/api/patients/${patientAccount.patient._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ accountStatus: "disabled" });
    const profileResponse = await request(app)
      .get("/api/patients/me")
      .set("Authorization", `Bearer ${patientAccount.token}`);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.accountStatus).toBe("disabled");
    expect(profileResponse.status).toBe(403);
    expect(profileResponse.body.message).toBe("Account is disabled.");
  });

  it("soft-deletes a patient and cancels scheduled appointments", async () => {
    const { token: adminToken } = await createAdmin();
    const doctorAccount = await createDoctor();
    const patientAccount = await createPatient();
    const appointment = await Appointment.create({
      doctorId: doctorAccount.doctor._id,
      patientId: patientAccount.patient._id,
      dateAndTime: new Date(Date.now() + 86_400_000),
    });

    const response = await request(app)
      .delete(`/api/patients/${patientAccount.patient._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    const rawPatient = await Patient.collection.findOne({
      _id: patientAccount.patient._id,
    });
    const rawUser = await User.collection.findOne({
      _id: patientAccount.user._id,
    });
    const updatedAppointment = await Appointment.findById(appointment._id).lean();
    expect(rawPatient?.isDeleted).toBe(true);
    expect(rawUser?.isDeleted).toBe(true);
    expect(updatedAppointment?.status).toBe("cancelled");
  });
});
