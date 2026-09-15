const Appointment = require("../models/Appointment.js");
const authClient = require("../clients/authClient.js");
const doctorClient = require("../clients/doctorClient.js");
const patientClient = require("../clients/patientClient.js");
const { toAppointmentRecord } = require("../utils/appointmentRecord.js");
const AppError = require("../utils/AppError.js");

type Actor = { id: string; role: "admin" | "doctor" | "patient" };
type ListInput = {
  page: number;
  limit: number;
  doctorId?: string;
  patientId?: string;
  requestId: string;
};

const unique = (values: string[]) => [...new Set(values)];

const hydrateAppointments = async (
  appointments: any[],
  requestId: string,
) => {
  if (appointments.length === 0) return [];

  const [doctors, patients] = await Promise.all([
    doctorClient.resolveByIds(
      unique(appointments.map((item) => item.doctorId)),
      requestId,
    ),
    patientClient.resolveByIds(
      unique(appointments.map((item) => item.patientId)),
      requestId,
    ),
  ]);
  const userIds = unique([
    ...doctors.map((doctor: any) => doctor.userId),
    ...patients.map((patient: any) => patient.userId),
  ]);
  const users = await authClient.resolveUsers(userIds, requestId);

  const doctorFor = (id: string) =>
    doctors.find((doctor: any) => doctor.id === id);
  const patientFor = (id: string) =>
    patients.find((patient: any) => patient.id === id);
  const userFor = (id: string) =>
    users.find((user: any) => user._id === id) || null;

  return appointments.map((appointment) => {
    const doctor = doctorFor(appointment.doctorId);
    const patient = patientFor(appointment.patientId);

    return {
      _id: appointment.id,
      doctorId: doctor
        ? {
            _id: doctor.id,
            userId: userFor(doctor.userId),
            title: doctor.title,
            speciality: doctor.speciality,
            unavailableDates: doctor.unavailableDates,
          }
        : null,
      patientId: patient
        ? {
            _id: patient.id,
            userId: userFor(patient.userId),
            accountStatus: patient.accountStatus,
          }
        : null,
      dateAndTime: appointment.dateAndTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  });
};

const getScope = async (
  actor: Actor,
  requestId: string,
  adminFilter: object,
) => {
  if (actor.role === "patient") {
    const patient = await patientClient.getByUserId(actor.id, requestId);
    if (!patient) {
      throw new AppError(
        "Patient profile not found.",
        404,
      );
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

  return adminFilter;
};

const getAppointments = async (actor: Actor, input: ListInput) => {
  const adminFilter = {
    ...(input.doctorId ? { doctorId: input.doctorId } : {}),
    ...(input.patientId ? { patientId: input.patientId } : {}),
  };
  const filter = await getScope(actor, input.requestId, adminFilter);

  const [documents, totalItems] = await Promise.all([
    Appointment.find(filter)
      .sort({ dateAndTime: 1 })
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    Appointment.countDocuments(filter),
  ]);
  const appointments = documents.map(toAppointmentRecord);

  return {
    items: await hydrateAppointments(appointments, input.requestId),
    pagination: {
      page: input.page,
      limit: input.limit,
      totalItems,
      totalPages: Math.ceil(totalItems / input.limit),
    },
  };
};

const getAppointmentById = async (
  actor: Actor,
  appointmentId: string,
  requestId: string,
) => {
  const scope = await getScope(actor, requestId, {});
  const document = await Appointment.findOne({
    _id: appointmentId,
    ...scope,
  }).lean();

  if (!document) {
    throw new AppError("Appointment not found.", 404);
  }

  const [appointment] = await hydrateAppointments(
    [toAppointmentRecord(document)],
    requestId,
  );
  if (!appointment) {
    throw new AppError("Appointment not found.", 404);
  }
  return appointment;
};

module.exports = {
  hydrateAppointments,
  getAppointments,
  getAppointmentById,
};
