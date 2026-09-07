const cron = require("node-cron");
import Appointment = require("../models/Appointment");
import BookingPolicy = require("../models/BookingPolicy");
const logger = require("../middleware/logger");
const getErrorMessage = require("../utils/getErrorMessage");
import type { ScheduledTask } from "node-cron";

let appointmentStatusTask: ScheduledTask | undefined;

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
        logger.error(`Appointment status job failed: ${getErrorMessage(error)}`);
      }
    },
  );

  logger.info(
    `Appointment status job scheduled every ${intervalMinutes} minute(s).`,
  );
};

export { completePastAppointments, startAppointmentStatusJob };
