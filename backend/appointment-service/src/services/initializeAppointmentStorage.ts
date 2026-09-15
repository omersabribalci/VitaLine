const Appointment = require("../models/Appointment.js");
const BookingPolicy = require("../models/BookingPolicy.js");

const initializeAppointmentStorage = async () => {
  // Do not accept traffic until MongoDB has created the concurrency guards.
  await Promise.all([Appointment.init(), BookingPolicy.init()]);

  // getPolicy is an atomic upsert: restarts reuse the same singleton document.
  await BookingPolicy.getPolicy();
};

module.exports = { initializeAppointmentStorage };
