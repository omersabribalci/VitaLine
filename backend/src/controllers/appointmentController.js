const AppError = require("../utils/AppError");
const Appointment = require("../models/Appointment");
const BookingPolicy = require("../models/BookingPolicy");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const isIdValid = require("../utils/isIdValid");
const {
  generateDaySlots,
  toDateString,
  toTimeString,
} = require("../utils/appointmentHelpers");
const {
  assertDateInFuture,
  assertWithinBookingWindow,
  assertIsWorkDay,
  assertWithinWorkingHours,
  assertSlotAligned,
  assertNotInLunchBreak,
  assertDoctorAvailable,
  assertNoDoctorConflict,
  assertNoPatientConflict,
} = require("../utils/appointmentValidation");

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

const buildAvailableSlots = async (doctor, policy, requestedDay, date) => {
  const allSlots = generateDaySlots(policy);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const bookedAppointments = await Appointment.find({
    doctorId: doctor._id,
    dateAndTime: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: "cancelled" },
  }).lean();

  const bookedTimes = new Set(
    bookedAppointments.map((app) => toTimeString(new Date(app.dateAndTime))),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = requestedDay.getTime() === today.getTime();
  const now = new Date();

  return allSlots.filter((slot) => {
    if (bookedTimes.has(slot)) return false;
    if (isToday) {
      const [h, m] = slot.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);
      if (slotDate <= now) return false;
    }
    return true;
  });
};

const getAvailability = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId) return next(new AppError("doctorId is required.", 400));
    if (!date) return next(new AppError("date is required (YYYY-MM-DD).", 400));

    isIdValid(doctorId);

    const requestedDate = new Date(`${date}T00:00:00`);
    if (isNaN(requestedDate.getTime())) {
      return next(
        new AppError("date must be a valid date in YYYY-MM-DD format.", 400),
      );
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return next(new AppError("Doctor not found.", 404));

    const policy = await BookingPolicy.getPolicy();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDay = new Date(`${date}T00:00:00`);
    requestedDay.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + policy.bookingWindowDays);

    const emptyResponse = { date, availableSlots: [], policy: null };

    if (requestedDay < today || requestedDay > maxDate) {
      return sendSuccessResponse(res, 200, emptyResponse);
    }

    if (!policy.defaultWorkDays.includes(requestedDay.getDay())) {
      return sendSuccessResponse(res, 200, emptyResponse);
    }

    const dateStr = toDateString(requestedDay);
    const isUnavailable = doctor.unavailableDates.some((range) => {
      const rangeStart = toDateString(new Date(range.start));
      const rangeEnd = toDateString(new Date(range.end));
      return dateStr >= rangeStart && dateStr < rangeEnd;
    });

    if (isUnavailable) {
      return sendSuccessResponse(res, 200, emptyResponse);
    }

    const availableSlots = await buildAvailableSlots(
      doctor,
      policy,
      requestedDay,
      date,
    );

    return sendSuccessResponse(res, 200, {
      date,
      availableSlots,
      policy: {
        slotDurationMinutes: policy.slotDurationMinutes,
        startHour: policy.defaultStartHour,
        endHour: policy.defaultEndHour,
        bookingWindowDays: policy.bookingWindowDays,
      },
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

    assertDateInFuture(appointmentDate);
    assertWithinBookingWindow(appointmentDate, policy);
    assertIsWorkDay(appointmentDate, policy);
    assertWithinWorkingHours(appointmentDate, policy);
    assertSlotAligned(appointmentDate, policy);
    assertNotInLunchBreak(appointmentDate, policy);
    assertDoctorAvailable(appointmentDate, doctor);
    await assertNoDoctorConflict(doctorId, appointmentDate);
    await assertNoPatientConflict(patientId, appointmentDate);

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
