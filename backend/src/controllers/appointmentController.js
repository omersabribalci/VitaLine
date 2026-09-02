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

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    isIdValid(id);

    const appointment = await Appointment.findById(id)
      .populate({ path: "doctorId", populate: { path: "userId" } })
      .populate({ path: "patientId", populate: { path: "userId" } })
      .lean();

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
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
    const { doctorId, patientId, dateAndTime } = req.body;

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

    const appointment = await Appointment.create(req.body);
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

    const appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }

    await appointment.populate([
      { path: "doctorId", populate: { path: "userId" } },
      { path: "patientId", populate: { path: "userId" } },
    ]);

    return sendSuccessResponse(
      res,
      200,
      appointment,
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
  getAppointmentById,
  getAvailability,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
