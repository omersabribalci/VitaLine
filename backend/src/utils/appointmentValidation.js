const AppError = require("./AppError");
const Appointment = require("../models/Appointment");
const { timeToMinutes, toDateString, toTimeString } = require("./appointmentHelpers");

const assertDateInFuture = (appointmentDate) => {
  if (appointmentDate <= new Date()) {
    throw new AppError("Appointment date must be in the future.", 400);
  }
};

const assertWithinBookingWindow = (appointmentDate, policy) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + policy.bookingWindowDays);
  maxDate.setHours(23, 59, 59, 999);
  if (appointmentDate > maxDate) {
    throw new AppError(
      `Appointments can only be booked up to ${policy.bookingWindowDays} days in advance.`,
      400,
    );
  }
};

const assertIsWorkDay = (appointmentDate, policy) => {
  if (!policy.defaultWorkDays.includes(appointmentDate.getDay())) {
    throw new AppError("Appointments cannot be booked on non-working days.", 400);
  }
};

const assertWithinWorkingHours = (appointmentDate, policy) => {
  const slotMinutes = timeToMinutes(toTimeString(appointmentDate));
  const startMinutes = timeToMinutes(policy.defaultStartHour);
  const endMinutes = timeToMinutes(policy.defaultEndHour);
  if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
    throw new AppError(
      `Appointments must be between ${policy.defaultStartHour} and ${policy.defaultEndHour}.`,
      400,
    );
  }
};

const assertSlotAligned = (appointmentDate, policy) => {
  const slotMinutes = timeToMinutes(toTimeString(appointmentDate));
  const startMinutes = timeToMinutes(policy.defaultStartHour);
  if ((slotMinutes - startMinutes) % policy.slotDurationMinutes !== 0) {
    throw new AppError(
      `Appointment time must align to ${policy.slotDurationMinutes}-minute slots.`,
      400,
    );
  }
};

const assertNotInLunchBreak = (appointmentDate, policy) => {
  if (!policy.lunchBreakStart || !policy.lunchBreakEnd) return;
  const slotMinutes = timeToMinutes(toTimeString(appointmentDate));
  const lunchStart = timeToMinutes(policy.lunchBreakStart);
  const lunchEnd = timeToMinutes(policy.lunchBreakEnd);
  if (slotMinutes >= lunchStart && slotMinutes < lunchEnd) {
    throw new AppError("Appointments cannot be booked during lunch break.", 400);
  }
};

const assertDoctorAvailable = (appointmentDate, doctor) => {
  const dateStr = toDateString(appointmentDate);
  const isUnavailable = doctor.unavailableDates.some((range) => {
    const rangeStart = toDateString(new Date(range.start));
    const rangeEnd = toDateString(new Date(range.end));
    return dateStr >= rangeStart && dateStr < rangeEnd;
  });
  if (isUnavailable) {
    throw new AppError("The selected doctor is not available on this date.", 400);
  }
};

const assertNoDoctorConflict = async (doctorId, appointmentDate) => {
  const conflict = await Appointment.findOne({
    doctorId,
    dateAndTime: appointmentDate,
    status: { $ne: "cancelled" },
  });
  if (conflict) {
    throw new AppError("This time slot is already booked for the selected doctor.", 409);
  }
};

const assertNoPatientConflict = async (patientId, appointmentDate) => {
  const conflict = await Appointment.findOne({
    patientId,
    dateAndTime: appointmentDate,
    status: { $ne: "cancelled" },
  });
  if (conflict) {
    throw new AppError("You already have an appointment at this time with another doctor.", 409);
  }
};

module.exports = {
  assertDateInFuture,
  assertWithinBookingWindow,
  assertIsWorkDay,
  assertWithinWorkingHours,
  assertSlotAligned,
  assertNotInLunchBreak,
  assertDoctorAvailable,
  assertNoDoctorConflict,
  assertNoPatientConflict,
};
