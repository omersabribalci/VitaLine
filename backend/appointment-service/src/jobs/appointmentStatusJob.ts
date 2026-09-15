const { subMinutes } = require("date-fns");
const Appointment = require("../models/Appointment.js");
const BookingPolicy = require("../models/BookingPolicy.js");

let timer: NodeJS.Timeout | undefined;

const completePastAppointments = async (
  appointmentDurationMinutes: number,
  now = new Date(),
) => {
  const result = await Appointment.updateMany(
    {
      dateAndTime: { $lte: subMinutes(now, appointmentDurationMinutes) },
      status: "scheduled",
      isDeleted: false,
    },
    { $set: { status: "completed" } },
  );
  return result.modifiedCount;
};

const stopAppointmentStatusJob = () => {
  if (timer) clearInterval(timer);
  timer = undefined;
};

const restartAppointmentStatusJob = async () => {
  stopAppointmentStatusJob();
  const policy = await BookingPolicy.getPolicy();
  const durationMinutes = policy.appointmentDurationMinutes;

  await completePastAppointments(durationMinutes);
  timer = setInterval(() => {
    completePastAppointments(durationMinutes).catch((error: unknown) => {
      console.error(
        "Appointment status job failed:",
        error instanceof Error ? error.message : error,
      );
    });
  }, durationMinutes * 60_000);
  timer.unref();
};

module.exports = {
  completePastAppointments,
  restartAppointmentStatusJob,
  stopAppointmentStatusJob,
};
