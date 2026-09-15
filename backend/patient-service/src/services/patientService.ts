const Patient = require("../models/Patient.js");
const authClient = require("../clients/authClient.js");
const appointmentClient = require("../clients/appointmentLifecycleClient.js");
const AppError = require("../utils/AppError.js");
const { buildPaginationMeta } = require("../utils/pagination.js");

const toPatient = (patient: any) => ({
  id: patient._id.toString(),
  userId: patient.userId.toString(),
  accountStatus: patient.accountStatus,
});

const toPublicPatient = (patient: any) => ({
  _id: patient._id.toString(),
  userId: patient.userId.toString(),
  accountStatus: patient.accountStatus,
});

const countPatients = () => Patient.countDocuments({ isDeleted: false });

const registerPatientProfile = async (userId: string) => {
  const existingPatient = await Patient.findOne({ userId }).lean();
  if (existingPatient) return toPatient(existingPatient);

  try {
    const patient = await Patient.create({
      userId,
      accountStatus: "enabled",
    });
    return toPatient(patient);
  } catch (error) {
    const duplicateUser =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11_000;

    if (duplicateUser) {
      const patient = await Patient.findOne({ userId }).lean();
      if (patient) return toPatient(patient);
    }
    throw error;
  }
};

const getPatientForAppointment = async (patientId: string) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  }).lean();
  return patient ? toPatient(patient) : null;
};

const getPatientForAppointmentByUserId = async (userId: string) => {
  const patient = await Patient.findOne({ userId, isDeleted: false }).lean();
  return patient ? toPatient(patient) : null;
};

const resolvePatientsForAppointments = async (patientIds: string[]) => {
  const patients = await Patient.find({
    _id: { $in: patientIds },
    isDeleted: false,
  }).lean();

  return patientIds.flatMap((patientId) => {
    const patient = patients.find(
      (item: any) => item._id.toString() === patientId,
    );
    return patient ? [toPatient(patient)] : [];
  });
};

const addUserInformation = async (patients: any[], requestId?: string) => {
  if (patients.length === 0) return [];

  const userIds = [...new Set(patients.map((patient) => patient.userId))];
  const users = await authClient.resolveUsers(userIds, requestId);

  return patients.flatMap((patient) => {
    const user = users.find((item: any) => item._id === patient.userId);
    return user ? [{ ...patient, userId: user }] : [];
  });
};

const getPatients = async (
  { page, limit }: { page: number; limit: number },
  requestId?: string,
) => {
  const documents = await Patient.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .lean();
  const patients = await addUserInformation(
    documents.map(toPublicPatient),
    requestId,
  );
  const skip = (page - 1) * limit;

  return {
    items: patients.slice(skip, skip + limit),
    pagination: buildPaginationMeta(page, limit, patients.length),
  };
};

const findPublicPatient = async (
  filter: Record<string, unknown>,
  requestId?: string,
) => {
  const document = await Patient.findOne({ ...filter, isDeleted: false }).lean();
  if (!document) throw new AppError("Patient profile not found.", 404);

  const [patient] = await addUserInformation(
    [toPublicPatient(document)],
    requestId,
  );
  if (!patient) throw new AppError("Patient profile not found.", 404);
  return patient;
};

const getPatientById = (patientId: string, requestId?: string) =>
  findPublicPatient({ _id: patientId }, requestId);

const getPatientByUserId = (userId: string, requestId?: string) =>
  findPublicPatient({ userId }, requestId);

const updatePatient = async (
  patientId: string,
  accountStatus: "enabled" | "disabled",
) => {
  const patient = await Patient.findOneAndUpdate(
    { _id: patientId, isDeleted: false },
    { accountStatus },
    { new: true, runValidators: true },
  ).lean();

  if (!patient) throw new AppError("Patient profile not found.", 404);
  return toPatient(patient);
};

const deletePatient = async (patientId: string, requestId?: string) => {
  const patient = await Patient.findById(patientId).lean();
  if (!patient || patient.isDeleted) {
    throw new AppError("Patient profile not found.", 404);
  }

  await appointmentClient.cancelForPatient(patientId, requestId);
  await authClient.deactivateUser(patient.userId.toString(), requestId);
  await Patient.findByIdAndUpdate(patientId, {
    accountStatus: "disabled",
    isDeleted: true,
  });
};

module.exports = {
  countPatients,
  registerPatientProfile,
  getPatientForAppointment,
  getPatientForAppointmentByUserId,
  resolvePatientsForAppointments,
  getPatients,
  getPatientById,
  getPatientByUserId,
  updatePatient,
  deletePatient,
};
