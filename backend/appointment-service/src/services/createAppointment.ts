const Appointment = require("../models/Appointment.js");
const BookingPolicy = require("../models/BookingPolicy.js");
const doctorClient = require("../clients/doctorClient.js");
const patientClient = require("../clients/patientClient.js");
const { validateAppointmentSlot } = require("../utils/appointmentRules.js");
const { getClinicDateKey } = require("../utils/appointmentTime.js");
const { toAppointmentRecord } = require("../utils/appointmentRecord.js");
const AppError = require("../utils/AppError.js");

type Actor = { id: string; role: "admin" | "doctor" | "patient" };
type CreateInput = {
  doctorId: string;
  patientId?: string;
  dateAndTime: string;
  status?: "scheduled" | "completed" | "cancelled";
  requestId: string;
};

const createAppointment = async (actor: Actor, input: CreateInput) => {
  const appointmentDate = new Date(input.dateAndTime);
  const patientRequest =
    actor.role === "patient"
      ? patientClient.getByUserId(actor.id, input.requestId)
      : patientClient.getById(input.patientId || "", input.requestId);

  const [doctor, patient, policy] = await Promise.all([
    doctorClient.getById(input.doctorId, input.requestId),
    patientRequest,
    BookingPolicy.getPolicy(),
  ]);

  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }
  if (!patient) {
    throw new AppError("Patient profile not found.", 404);
  }
  if (patient.accountStatus !== "enabled") {
    throw new AppError(
      "Disabled patients cannot create appointments.",
      403,
    );
  }

  validateAppointmentSlot(appointmentDate, policy, doctor);
  const bookingDateKey = getClinicDateKey(appointmentDate);
  const activeSlot = { status: "scheduled", isDeleted: false };

  const [doctorConflict, patientConflict, sameDoctorDay] = await Promise.all([
    Appointment.exists({
      doctorId: doctor.id,
      dateAndTime: appointmentDate,
      ...activeSlot,
    }),
    Appointment.exists({
      patientId: patient.id,
      dateAndTime: appointmentDate,
      ...activeSlot,
    }),
    Appointment.exists({
      patientId: patient.id,
      doctorId: doctor.id,
      bookingDateKey,
      ...activeSlot,
    }),
  ]);

  if (doctorConflict) {
    throw new AppError(
      "This time slot is already booked for the selected doctor.",
      409,
    );
  }
  if (sameDoctorDay) {
    throw new AppError(
      "Patient already has an appointment with this doctor on this day.",
      409,
    );
  }
  if (patientConflict) {
    throw new AppError(
      "Patient already has an appointment at this time.",
      409,
    );
  }

  try {
    const appointment = await Appointment.create({
      doctorId: doctor.id,
      patientId: patient.id,
      dateAndTime: appointmentDate,
      bookingDateKey,
      status:
        actor.role === "admin" ? input.status || "scheduled" : "scheduled",
    });
    return toAppointmentRecord(appointment);
  } catch (error: unknown) {
    const duplicateSlot =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11_000;

    if (duplicateSlot) {
      throw new AppError(
        "The selected appointment slot was booked concurrently.",
        409,
      );
    }
    throw error;
  }
};

module.exports = {
  createAppointment,
};
