const Appointment = require("../models/Appointment.js");
const authClient = require("../clients/authClient.js");
const doctorClient = require("../clients/doctorClient.js");
const patientClient = require("../clients/patientClient.js");

const getAppointmentStatistics = async (requestId: string) => {
  const [appointmentCount, statusRows, doctorRows, doctorCount, patientCount] =
    await Promise.all([
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $group: { _id: "$doctorId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      doctorClient.countActive(requestId),
      patientClient.countActive(requestId),
    ]);

  const statusCounts: Record<string, number> = {
    completed: 0,
    cancelled: 0,
    scheduled: 0,
  };
  statusRows.forEach((row: any) => {
    statusCounts[row._id] = row.count;
  });

  const doctorIds = doctorRows.map((row: any) => row._id.toString());
  const doctors = await doctorClient.resolveByIds(doctorIds, requestId);
  const users = await authClient.resolveUsers(
    doctors.map((doctor: any) => doctor.userId),
    requestId,
  );

  const appointmentsByDoctor = doctorRows.flatMap((row: any) => {
    const doctor = doctors.find(
      (item: any) => item.id === row._id.toString(),
    );
    const user = doctor
      ? users.find((item: any) => item._id === doctor.userId)
      : null;

    return doctor && user
      ? [
          {
            doctorId: doctor.id,
            doctorName: doctor.title + " " + user.name,
            count: row.count,
          },
        ]
      : [];
  });

  const appointmentsBySpeciality: Array<{
    speciality: string;
    count: number;
  }> = [];

  appointmentsByDoctor.forEach((row: any) => {
    const doctor = doctors.find((item: any) => item.id === row.doctorId);
    if (!doctor) return;

    const existing = appointmentsBySpeciality.find(
      (item) => item.speciality === doctor.speciality,
    );
    if (existing) existing.count += row.count;
    else {
      appointmentsBySpeciality.push({
        speciality: doctor.speciality,
        count: row.count,
      });
    }
  });

  appointmentsBySpeciality.sort((first, second) => second.count - first.count);

  return {
    doctorCount,
    patientCount,
    appointmentCount,
    statusCounts,
    appointmentsByDoctor,
    appointmentsBySpeciality,
  };
};

module.exports = { getAppointmentStatistics };
