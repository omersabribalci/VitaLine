const buildStatusCounts = (statusRows) => {
  const status = statusRows.reduce((result, row) => {
    result[row._id] = row.count;
    return result;
  }, {});

  return {
    completed: status.completed || 0,
    cancelled: status.cancelled || 0,
    scheduled: status.scheduled || 0,
  };
};

const buildDoctorStatistics = (doctorRows, doctors) => {
  const doctorsById = new Map(
    doctors.map((doctor) => [doctor._id.toString(), doctor]),
  );

  const appointmentsByDoctor = doctorRows
    .map((row) => {
      const doctor = doctorsById.get(row._id.toString());
      if (!doctor) return null;

      return {
        doctorId: doctor._id,
        doctorName: `${doctor.title} ${doctor.userId.name}`,
        count: row.count,
      };
    })
    .filter(Boolean);

  return { doctorsById, appointmentsByDoctor };
};

const buildSpecialityStatistics = (appointmentsByDoctor, doctorsById) => {
  const counts = {};

  appointmentsByDoctor.forEach((appointment) => {
    const doctor = doctorsById.get(appointment.doctorId.toString());
    if (doctor) {
      counts[doctor.speciality] =
        (counts[doctor.speciality] || 0) + appointment.count;
    }
  });

  return Object.entries(counts)
    .map(([speciality, count]) => ({ speciality, count }))
    .sort((first, second) => second.count - first.count);
};

module.exports = {
  buildStatusCounts,
  buildDoctorStatistics,
  buildSpecialityStatistics,
};
