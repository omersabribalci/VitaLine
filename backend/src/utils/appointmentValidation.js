const AppError = require("./AppError");
const Appointment = require("../models/Appointment");
const {
  format,
  parse,
  differenceInMinutes,
  addMinutes,
  startOfDay,
  endOfDay,
} = require("date-fns");
const {
  checkDateRules,
  isWithinWorkingHours,
  isDuringLunchBreak,
} = require("./appointmentHelpers");

// Randevu oluşturulurken tüm kuralları ve çakışmaları denetler.
const validateAppointmentSlot = (appointmentDate, policy, doctor) => {
  // 1. Ortak Gün Kontrolleri (Geçmiş, Pencere, Çalışma Günü, Doktor İzni)
  const errorMsg = checkDateRules(appointmentDate, policy, doctor);
  if (errorMsg) {
    throw new AppError(errorMsg, 400);
  }

  // Randevunun bitiş zamanını hesapla
  const appointmentEndDate = addMinutes(
    appointmentDate,
    policy.appointmentDurationMinutes,
  );

  const timeString = format(appointmentDate, "HH:mm");
  const endTimeString = format(appointmentEndDate, "HH:mm");

  // 2. Mesai Saatleri Kontrolü
  if (!isWithinWorkingHours(timeString, endTimeString, policy)) {
    throw new AppError(
      `Appointments must be between ${policy.workingTimeStart} and ${policy.workingTimeEnd}, and must not exceed working hours.`,
      400,
    );
  }

  // 3. Öğle Arası Kontrolü
  if (isDuringLunchBreak(timeString, endTimeString, policy)) {
    throw new AppError(
      "Appointments cannot overlap with the lunch break.",
      400,
    );
  }

  // 4. Slot Hizalama
  const dateStr = format(appointmentDate, "yyyy-MM-dd");
  const shiftStart = parse(
    `${dateStr} ${policy.workingTimeStart}`,
    "yyyy-MM-dd HH:mm",
    new Date(),
  );

  const diffInMins = differenceInMinutes(appointmentDate, shiftStart);

  if (diffInMins % policy.appointmentDurationMinutes !== 0) {
    throw new AppError(
      `Appointment time must align to ${policy.appointmentDurationMinutes}-minute slots.`,
      400,
    );
  }
};

// Doktor Çakışma Kontrolü
const assertNoDoctorConflict = async (
  doctorId,
  appointmentDate,
  excludeAppointmentId = null,
) => {
  const query = {
    doctorId,
    dateAndTime: appointmentDate,
    status: { $ne: "cancelled" },
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const conflict = await Appointment.findOne(query).lean();

  if (conflict) {
    throw new AppError(
      "This time slot is already booked for the selected doctor.",
      409,
    );
  }
};

// Hasta Çakışma Kontrolü
const assertNoPatientConflict = async (
  patientId,
  doctorId,
  appointmentDate,
  excludeAppointmentId = null,
) => {
  const sameDoctorQuery = {
    doctorId,
    patientId,
    dateAndTime: {
      $gte: startOfDay(appointmentDate),
      $lte: endOfDay(appointmentDate),
    },
    status: { $ne: "cancelled" },
  };

  const sameTimeQuery = {
    patientId,
    dateAndTime: appointmentDate,
    status: { $ne: "cancelled" },
  };

  if (excludeAppointmentId) {
    sameDoctorQuery._id = { $ne: excludeAppointmentId };
    sameTimeQuery._id = { $ne: excludeAppointmentId };
  }

  const [sameDoctorConflict, sameTimeConflict] = await Promise.all([
    Appointment.findOne(sameDoctorQuery).lean(),
    Appointment.findOne(sameTimeQuery).lean(),
  ]);

  if (sameDoctorConflict) {
    throw new AppError(
      "You already have an appointment with this doctor on this day.",
      409,
    );
  }

  if (sameTimeConflict) {
    throw new AppError(
      "You already have an appointment at this time with another doctor.",
      409,
    );
  }
};

module.exports = {
  validateAppointmentSlot,
  assertNoDoctorConflict,
  assertNoPatientConflict,
};
