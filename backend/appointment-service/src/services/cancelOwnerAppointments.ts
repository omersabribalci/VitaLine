const Appointment = require("../models/Appointment.js");

type AppointmentOwner = "patient" | "doctor";

type CancelOwnerAppointments = (
  owner: AppointmentOwner,
  ownerId: string,
) => Promise<{ cancelledCount: number }>;

const cancelOwnerAppointments: CancelOwnerAppointments = async (
  owner,
  ownerId,
) => {
  const result = await Appointment.updateMany(
    {
      [owner === "patient" ? "patientId" : "doctorId"]: ownerId,
      status: "scheduled",
      isDeleted: false,
    },
    { $set: { status: "cancelled" } },
  );
  return { cancelledCount: result.modifiedCount };
};

module.exports = { cancelOwnerAppointments };
