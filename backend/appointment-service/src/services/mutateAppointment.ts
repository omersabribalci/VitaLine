const Appointment = require("../models/Appointment.js");
const BookingPolicy = require("../models/BookingPolicy.js");
const doctorClient = require("../clients/doctorClient.js");
const patientClient = require("../clients/patientClient.js");
const { validateAppointmentSlot } = require("../utils/appointmentRules.js");
const { getClinicDateKey } = require("../utils/appointmentTime.js");
const { toAppointmentRecord } = require("../utils/appointmentRecord.js");
const appointmentDirectory = require("./appointmentDirectory.js");
const AppError = require("../utils/AppError.js");

type Actor = { id: string; role: "admin" | "doctor" | "patient" };
type UpdateInput = {
  doctorId?: string;
  patientId?: string;
  dateAndTime?: string;
  status?: "scheduled" | "completed" | "cancelled";
  requestId: string;
};

const getActorScope = async (actor: Actor, requestId: string) => {
  if (actor.role === "patient") {
    const patient = await patientClient.getByUserId(actor.id, requestId);
    if (!patient) {
      throw new AppError("Patient profile not found.", 404);
    }
    return { patientId: patient.id };
  }

  if (actor.role === "doctor") {
    const doctor = await doctorClient.getByUserId(actor.id, requestId);
    if (!doctor) {
      throw new AppError("Doctor profile not found.", 404);
    }
    return { doctorId: doctor.id };
  }

  return {};
};

const checkUpdatePermission = (actor: Actor, input: UpdateInput) => {
  const fields = Object.keys(input).filter(
    (field) => field !== "requestId" && input[field as keyof UpdateInput] !== undefined,
  );

  if (
    actor.role === "patient" &&
    (fields.length !== 1 || input.status !== "cancelled")
  ) {
    throw new AppError(
      "Patients can only cancel their own appointments.",
      403,
    );
  }

  if (
    actor.role === "doctor" &&
    (fields.length !== 1 || fields[0] !== "status")
  ) {
    throw new AppError(
      "Doctors can only update appointment status.",
      403,
    );
  }
};

const updateAppointment = async (
  actor: Actor,
  appointmentId: string,
  input: UpdateInput,
) => {
  const scope = await getActorScope(actor, input.requestId);
  const document = await Appointment.findOne({
    _id: appointmentId,
    ...scope,
  }).lean();

  if (!document) {
    throw new AppError("Appointment not found.", 404);
  }

  checkUpdatePermission(actor, input);
  const existing = toAppointmentRecord(document);
  const doctorId = input.doctorId || existing.doctorId;
  const patientId = input.patientId || existing.patientId;
  const dateAndTime = input.dateAndTime
    ? new Date(input.dateAndTime)
    : existing.dateAndTime;
  const status = input.status || existing.status;
  const bookingDateKey = getClinicDateKey(dateAndTime);
  const scheduleChanged =
    doctorId !== existing.doctorId ||
    patientId !== existing.patientId ||
    dateAndTime.getTime() !== existing.dateAndTime.getTime() ||
    existing.status !== "scheduled";

  if (status === "scheduled" && scheduleChanged) {
    const [doctor, patient, policy] = await Promise.all([
      doctorClient.getById(doctorId, input.requestId),
      patientClient.getById(patientId, input.requestId),
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
        "Disabled patients cannot hold scheduled appointments.",
        403,
      );
    }

    validateAppointmentSlot(dateAndTime, policy, doctor);
    const otherAppointment = { _id: { $ne: appointmentId } };
    const activeSlot = { status: "scheduled", isDeleted: false };
    const [doctorConflict, patientConflict, sameDoctorDay] = await Promise.all([
      Appointment.exists({
        doctorId,
        dateAndTime,
        ...activeSlot,
        ...otherAppointment,
      }),
      Appointment.exists({
        patientId,
        dateAndTime,
        ...activeSlot,
        ...otherAppointment,
      }),
      Appointment.exists({
        patientId,
        doctorId,
        bookingDateKey,
        ...activeSlot,
        ...otherAppointment,
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
  }

  try {
    const updated = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      { doctorId, patientId, dateAndTime, bookingDateKey, status },
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!updated) {
      throw new AppError("Appointment not found.", 404);
    }

    const [view] = await appointmentDirectory.hydrateAppointments(
      [toAppointmentRecord(updated)],
      input.requestId,
    );
    if (!view) {
      throw new AppError("Appointment not found.", 404);
    }
    return view;
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

const deleteAppointment = async (appointmentId: string) => {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: appointmentId },
    { isDeleted: true },
    { returnDocument: "after", runValidators: true },
  )
    .select("_id")
    .lean();

  if (!appointment) {
    throw new AppError("Appointment not found.", 404);
  }
};

module.exports = {
  updateAppointment,
  deleteAppointment,
};
