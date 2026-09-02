const AppError = require("../utils/AppError");
const Appointment = require("../models/Appointment");
const BookingPolicy = require("../models/BookingPolicy");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const isIdValid = require("../utils/isIdValid");
const {
  isDateAvailableForBooking,
  generateSlotsForDay,
} = require("../utils/appointmentHelpers");
const {
  validateAppointmentSlot,
  assertNoDoctorConflict,
  assertNoPatientConflict,
} = require("../utils/appointmentValidation");
const { parseISO } = require("date-fns/parseISO");
const { startOfDay } = require("date-fns/startOfDay");
const { endOfDay } = require("date-fns/endOfDay");
const {
  buildStatusCounts,
  buildDoctorStatistics,
  buildSpecialityStatistics,
} = require("../utils/appointmentStatistics");

const getAppointments = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user.id });

      if (!patient)
        return next(new AppError("Patient profile not found.", 404));
      filter.patientId = patient?._id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });

      if (!doctor) return next(new AppError("Doctor profile not found.", 404));
      filter.doctorId = doctor?._id;
    } else {
      if (req.query.doctorId) filter.doctorId = req.query.doctorId;
      if (req.query.patientId) filter.patientId = req.query.patientId;
    }

    const appointments = await Appointment.find(filter)
      .populate({ path: "doctorId", populate: { path: "userId" } })
      .populate({ path: "patientId", populate: { path: "userId" } })
      .sort({ dateAndTime: 1 })
      .lean();

    return sendSuccessResponse(res, 200, appointments);
  } catch (error) {
    next(error);
  }
};

const getAdminStatistics = async (req, res, next) => {
  try {
    const activeAppointmentFilter = { isDeleted: false };

    const [
      doctorCount,
      patientCount,
      appointmentCount,
      statusCounts,
      doctorCounts,
    ] = await Promise.all([
      Doctor.countDocuments({ isDeleted: false }),
      Patient.countDocuments({ isDeleted: false }),
      Appointment.countDocuments(activeAppointmentFilter),
      Appointment.aggregate([
        { $match: activeAppointmentFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: activeAppointmentFilter },
        { $group: { _id: "$doctorId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const doctorIds = doctorCounts.map((item) => item._id);
    const doctors = await Doctor.find({
      _id: { $in: doctorIds },
      isDeleted: false,
    })
      .populate("userId")
      .lean();

    const { doctorsById, appointmentsByDoctor } = buildDoctorStatistics(
      doctorCounts,
      doctors,
    );

    return sendSuccessResponse(res, 200, {
      doctorCount,
      patientCount,
      appointmentCount,
      statusCounts: buildStatusCounts(statusCounts),
      appointmentsByDoctor,
      appointmentsBySpeciality: buildSpecialityStatistics(
        appointmentsByDoctor,
        doctorsById,
      ),
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    isIdValid(id);

    const filter = { _id: id };

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) {
        return next(new AppError("Patient profile not found.", 404));
      }
      filter.patientId = patient._id;
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return next(new AppError("Doctor profile not found.", 404));
      }
      filter.doctorId = doctor._id;
    }

    const appointment = await Appointment.findOne(filter)
      .populate({ path: "doctorId", populate: { path: "userId" } })
      .populate({ path: "patientId", populate: { path: "userId" } })
      .lean();

    if (!appointment) {
      return next(new AppError("Appointment not found.", 404));
    }
    return sendSuccessResponse(res, 200, appointment);
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new AppError("Doctor not found.", 404));
    const policy = await BookingPolicy.getPolicy();
    const targetDate = parseISO(date);

    if (!isDateAvailableForBooking(targetDate, policy, doctor)) {
      return sendSuccessResponse(res, 200, {
        date,
        doctorId,
        slots: [],
      });
    }

    const existingAppointments = await Appointment.find({
      doctorId: doctorId,
      dateAndTime: {
        $gte: startOfDay(targetDate),
        $lte: endOfDay(targetDate),
      },
      status: { $ne: "cancelled" },
    }).lean();

    const slots = generateSlotsForDay(
      policy,
      targetDate,
      date,
      existingAppointments,
    );

    return sendSuccessResponse(res, 200, {
      date,
      doctorId,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, dateAndTime, status } = req.body;
    let patientId = req.body.patientId;

    if (req.user.role === "patient") {
      const patientProfile = await Patient.findOne({ userId: req.user.id });
      if (!patientProfile) {
        return next(new AppError("Patient profile not found.", 404));
      }
      patientId = patientProfile._id;
    }

    const [doctor, patient] = await Promise.all([
      Doctor.findById(doctorId),
      Patient.findById(patientId),
    ]);

    if (!doctor) return next(new AppError("Doctor could not be found!", 400));
    if (!patient) return next(new AppError("Patient could not be found!", 400));

    const policy = await BookingPolicy.getPolicy();
    const appointmentDate = new Date(dateAndTime);

    validateAppointmentSlot(appointmentDate, policy, doctor);
    await assertNoDoctorConflict(doctorId, appointmentDate);
    await assertNoPatientConflict(patientId, doctorId, appointmentDate);

    const appointmentData = {
      doctorId,
      patientId,
      dateAndTime,
    };

    if (req.user.role === "admin" && status !== undefined) {
      appointmentData.status = status;
    }

    const appointment = await Appointment.create(appointmentData);
    await appointment.populate([
      { path: "doctorId", populate: { path: "userId" } },
      { path: "patientId", populate: { path: "userId" } },
    ]);

    return sendSuccessResponse(
      res,
      201,
      appointment,
      "Appointment created successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    isIdValid(id);

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new AppError("Appointment not found.", 404));
    }

    if (req.user.role === "patient") {
      const patient = await Patient.findOne({ userId: req.user.id });
      const ownsAppointment =
        patient && appointment.patientId.toString() === patient._id.toString();

      if (!ownsAppointment) {
        return next(new AppError("Appointment not found.", 404));
      }

      const fields = Object.keys(req.body);
      if (fields.length !== 1 || req.body.status !== "cancelled") {
        return next(
          new AppError("Patients can only cancel their own appointments.", 403),
        );
      }
    }

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      const ownsAppointment =
        doctor && appointment.doctorId.toString() === doctor._id.toString();

      if (!ownsAppointment) {
        return next(new AppError("Appointment not found.", 404));
      }

      const fields = Object.keys(req.body);
      if (fields.length !== 1 || !fields.includes("status")) {
        return next(
          new AppError("Doctors can only update appointment status.", 403),
        );
      }
    }

    const allowedFields = ["doctorId", "patientId", "dateAndTime", "status"];
    const updateData = Object.fromEntries(
      Object.entries(req.body).filter(([field]) =>
        allowedFields.includes(field),
      ),
    );

    if (Object.keys(updateData).length === 0) {
      return next(new AppError("No valid fields provided to update.", 400));
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    await updatedAppointment.populate([
      { path: "doctorId", populate: { path: "userId" } },
      { path: "patientId", populate: { path: "userId" } },
    ]);

    return sendSuccessResponse(
      res,
      200,
      updatedAppointment,
      "Appointment updated successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    isIdValid(id);

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { returnDocument: "after", runValidators: true },
    );

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      null,
      "Appointment is deleted successfully!",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAdminStatistics,
  getAppointmentById,
  getAvailability,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
