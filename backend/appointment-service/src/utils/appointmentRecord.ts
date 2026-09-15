const toAppointmentRecord = (appointment: any) => ({
  id: appointment._id.toString(),
  doctorId: appointment.doctorId.toString(),
  patientId: appointment.patientId.toString(),
  dateAndTime: appointment.dateAndTime,
  bookingDateKey: appointment.bookingDateKey,
  status: appointment.status,
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt,
});

module.exports = { toAppointmentRecord };
