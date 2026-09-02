const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const BookingPolicy = require("../models/BookingPolicy");
const logger = require("../middleware/logger");

let appointmentStatusTask;

const completePastAppointments = async () => {
  const result = await Appointment.updateMany(
    {
      dateAndTime: { $lt: new Date() },
      status: "scheduled",
      isDeleted: false,
    },
    {
      $set: { status: "completed" },
    },
  );

  if (result.modifiedCount > 0) {
    logger.info(
      `${result.modifiedCount} appointment(s) automatically marked as completed.`,
    );
  }

  return result;
};

const startAppointmentStatusJob = async () => {
  const policy = await BookingPolicy.getPolicy();
  const intervalMinutes = policy.appointmentDurationMinutes;

  if (appointmentStatusTask) {
    appointmentStatusTask.stop();
  }

  appointmentStatusTask = cron.schedule(
    `*/${intervalMinutes} * * * *`,
    async () => {
      try {
        await completePastAppointments();
      } catch (error) {
        logger.error(`Appointment status job failed: ${error.message}`);
      }
    },
  );

  logger.info(
    `Appointment status job scheduled every ${intervalMinutes} minute(s).`,
  );
};

module.exports = { completePastAppointments, startAppointmentStatusJob };
