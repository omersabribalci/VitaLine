const Doctor = require("../models/Doctor.js");
const authClient = require("../clients/authClient.js");
const appointmentClient = require("../clients/appointmentLifecycleClient.js");
const AppError = require("../utils/AppError.js");
const { buildPaginationMeta, getPagination } = require("../utils/pagination.js");
const { doctorTitles, doctorSpecialities } = require("../config/doctorCatalog.js");

const toInternalDoctor = (doctor: any) => ({
  id: doctor._id.toString(),
  userId: doctor.userId.toString(),
  title: doctor.title,
  speciality: doctor.speciality,
  unavailableDates: doctor.unavailableDates || [],
});

const toPublicDoctor = (doctor: any) => ({
  _id: doctor._id.toString(),
  userId: doctor.userId.toString(),
  title: doctor.title,
  speciality: doctor.speciality,
  unavailableDates: doctor.unavailableDates || [],
});

const countDoctors = () => Doctor.countDocuments();

const getDoctorCatalog = () => ({
  titles: [...doctorTitles],
  specialities: [...doctorSpecialities],
});

const getAvailableSpecialities = async () => {
  const available = await Doctor.distinct("speciality", { isDeleted: false });
  return doctorSpecialities.filter((speciality: string) =>
    available.includes(speciality),
  );
};

const getDoctorForAppointment = async (doctorId: string) => {
  const doctor = await Doctor.findOne({ _id: doctorId }).lean();
  return doctor ? toInternalDoctor(doctor) : null;
};

const getDoctorForAppointmentByUserId = async (userId: string) => {
  const doctor = await Doctor.findOne({ userId }).lean();
  return doctor ? toInternalDoctor(doctor) : null;
};

const resolveDoctorsForAppointments = async (doctorIds: string[]) => {
  const doctors = await Doctor.find({
    _id: { $in: doctorIds },
  }).lean();

  return doctorIds.flatMap((doctorId) => {
    const doctor = doctors.find(
      (item: any) => item._id.toString() === doctorId,
    );
    return doctor ? [toInternalDoctor(doctor)] : [];
  });
};

const addUserInformation = async (
  doctors: any[],
  requestId?: string,
) => {
  if (doctors.length === 0) return [];

  const userIds = [...new Set(doctors.map((doctor) => doctor.userId))];
  const users = await authClient.resolveUsers(userIds, requestId);

  return doctors.flatMap((doctor) => {
    const user = users.find((item: any) => item._id === doctor.userId);
    return user ? [{ ...doctor, userId: user }] : [];
  });
};

const getDoctors = async (
  input: {
    search?: string;
    speciality?: string;
    sort?: "name";
    page: number;
    limit: number;
  },
  requestId?: string,
) => {
  const filter = input.speciality ? { speciality: input.speciality } : {};
  const documents = await Doctor.find(filter).lean();
  let doctors = await addUserInformation(
    documents.map(toPublicDoctor),
    requestId,
  );

  if (input.search) {
    const search = input.search.toLocaleLowerCase();
    doctors = doctors.filter((doctor) =>
      doctor.userId.name.toLocaleLowerCase().includes(search),
    );
  }

  if (input.sort === "name") {
    doctors.sort((first, second) =>
      first.userId.name.localeCompare(second.userId.name),
    );
  }

  const { page, limit, skip } = getPagination(input.page, input.limit);
  return {
    items: doctors.slice(skip, skip + limit),
    pagination: buildPaginationMeta(page, limit, doctors.length),
  };
};

const findPublicDoctor = async (
  filter: Record<string, unknown>,
  requestId?: string,
) => {
  const document = await Doctor.findOne(filter).lean();
  if (!document) throw new AppError("Doctor profile not found.", 404);

  const [doctor] = await addUserInformation(
    [toPublicDoctor(document)],
    requestId,
  );
  if (!doctor) throw new AppError("Doctor profile not found.", 404);
  return doctor;
};

const getDoctorById = (doctorId: string, requestId?: string) =>
  findPublicDoctor({ _id: doctorId }, requestId);

const getDoctorByUserId = (userId: string, requestId?: string) =>
  findPublicDoctor({ userId }, requestId);

const createDoctor = async (input: any, requestId?: string) => {
  const user = await authClient.createDoctorUser(
    {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
      image: input.image || "",
    },
    requestId,
  );

  try {
    const doctor = await Doctor.create({
      userId: user._id,
      title: input.title,
      speciality: input.speciality,
    });
    return { user, doctor: toInternalDoctor(doctor) };
  } catch (error) {
    await authClient.deactivateUser(user._id, requestId);

    const duplicateUser =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11_000;
    if (duplicateUser) {
      throw new AppError("A doctor profile already exists for this user.", 409);
    }
    throw error;
  }
};

const updateDoctor = async (
  doctorId: string,
  actor: { id: string; role: "admin" | "doctor" | "patient" },
  input: Record<string, any>,
  requestId?: string,
) => {
  const doctor = await Doctor.findById(doctorId).select("userId").lean();
  if (!doctor) throw new AppError("Doctor profile not found.", 404);

  if (actor.role === "doctor" && doctor.userId.toString() !== actor.id) {
    throw new AppError("You can only update your own doctor profile.", 403);
  }

  const userChanges = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.email !== undefined ? { email: input.email } : {}),
    ...(input.phone !== undefined ? { phone: input.phone } : {}),
    ...(input.image !== undefined ? { image: input.image } : {}),
  };
  const doctorChanges = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.speciality !== undefined ? { speciality: input.speciality } : {}),
    ...(input.unavailableDates !== undefined
      ? {
          unavailableDates: input.unavailableDates.map((range: any) => ({
            start: new Date(range.start),
            end: new Date(range.end),
          })),
        }
      : {}),
  };

  if (Object.keys(userChanges).length > 0) {
    await authClient.updateUserProfile(
      doctor.userId.toString(),
      userChanges,
      requestId,
    );
  }

  if (input.password !== undefined) {
    await authClient.updateUserPassword(
      doctor.userId.toString(),
      input.password,
      requestId,
    );
  }

  if (Object.keys(doctorChanges).length > 0) {
    await Doctor.findByIdAndUpdate(doctorId, doctorChanges, {
      runValidators: true,
    });
  }
};

const deleteDoctor = async (doctorId: string, requestId?: string) => {
  const doctor = await Doctor.findById(doctorId).select("userId").lean();
  if (!doctor) throw new AppError("Doctor profile not found.", 404);

  await appointmentClient.cancelForDoctor(doctorId, requestId);
  await authClient.deactivateUser(doctor.userId.toString(), requestId);
  await Doctor.findByIdAndUpdate(doctorId, { isDeleted: true });
};

module.exports = {
  countDoctors,
  getDoctorCatalog,
  getAvailableSpecialities,
  getDoctorForAppointment,
  getDoctorForAppointmentByUserId,
  resolveDoctorsForAppointments,
  getDoctors,
  getDoctorById,
  getDoctorByUserId,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
