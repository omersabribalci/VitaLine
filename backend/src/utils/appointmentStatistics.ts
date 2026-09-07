interface CountRow {
  _id: { toString(): string } | string;
  count: number;
}

interface PopulatedDoctor {
  _id: { toString(): string };
  title: string;
  speciality: string;
  userId: { name: string };
}

interface DoctorAppointmentCount {
  doctorId: { toString(): string };
  doctorName: string;
  count: number;
}

const buildStatusCounts = (statusRows: CountRow[]) => {
  const status = statusRows.reduce<Record<string, number>>((result, row) => {
    result[row._id.toString()] = row.count;
    return result;
  }, {});

  return {
    completed: status.completed || 0,
    cancelled: status.cancelled || 0,
    scheduled: status.scheduled || 0,
  };
};

const buildDoctorStatistics = (
  doctorRows: CountRow[],
  doctors: PopulatedDoctor[],
) => {
  const doctorsById = new Map<string, PopulatedDoctor>(
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
    .filter(
      (appointment): appointment is DoctorAppointmentCount =>
        appointment !== null,
    );

  return { doctorsById, appointmentsByDoctor };
};

const buildSpecialityStatistics = (
  appointmentsByDoctor: DoctorAppointmentCount[],
  doctorsById: Map<string, PopulatedDoctor>,
) => {
  const counts: Record<string, number> = {};

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

export {
  buildStatusCounts,
  buildDoctorStatistics,
  buildSpecialityStatistics,
};
