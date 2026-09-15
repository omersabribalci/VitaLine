const BookingPolicy = require("../models/BookingPolicy.js");
const appointmentStatusJob = require("../jobs/appointmentStatusJob.js");

const toView = (policy: any) => ({
  appointmentDurationMinutes: policy.appointmentDurationMinutes,
  bookingWindowDays: policy.bookingWindowDays,
  workingTimeStart: policy.workingTimeStart,
  workingTimeEnd: policy.workingTimeEnd,
  workingDays: policy.workingDays,
  lunchBreakStart: policy.lunchBreakStart,
  lunchBreakEnd: policy.lunchBreakEnd,
});

const getBookingPolicy = async () => {
  const policy = await BookingPolicy.getPolicy();
  return toView(policy);
};

const updateBookingPolicy = async (input: object) => {
  const policy = await BookingPolicy.getPolicy();
  Object.assign(policy, input);
  await policy.save();
  await appointmentStatusJob.restartAppointmentStatusJob();
  return toView(policy);
};

module.exports = { getBookingPolicy, updateBookingPolicy };
