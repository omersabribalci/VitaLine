const AppError = require("./AppError");
const Appointment = require("../models/Appointment");
const { format, parse, differenceInMinutes } = require("date-fns");
const { startOfDay, endOfDay } = require("date-fns");
const { checkDateRules } = require("./appointmentHelpers");

// Randevu oluşturulurken tüm kuralları ve çakışmaları denetler.

const validateAppointmentSlot = (appointmentDate, policy, doctor) => {
  // 1. Ortak Gün Kontrolleri (Geçmiş, Pencere, Çalışma Günü, Doktor İzni)
  const errorMsg = checkDateRules(appointmentDate, policy, doctor);
  if (errorMsg) {
    throw new AppError(errorMsg, 400);
  }

  // 2. Mesai Saatleri Kontrolü
  const timeString = format(appointmentDate, "HH:mm");

  if (
    timeString < policy.workingTimeStart ||
    timeString >= policy.workingTimeEnd
  ) {
    throw new AppError(
      `Appointments must be between ${policy.workingTimeStart} and ${policy.workingTimeEnd}.`,
      400,
    );
  }

  // 3. Öğle Arası Kontrolü
  if (policy.lunchBreakStart && policy.lunchBreakEnd) {
    if (
      timeString >= policy.lunchBreakStart &&
      timeString < policy.lunchBreakEnd
    ) {
      throw new AppError(
        "Appointments cannot be booked during lunch break.",
        400,
      );
    }
  }

  // 4. Slot Hizalama (Periyot Uyumu) Kontrolü
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

const assertNoDoctorConflict = async (doctorId, appointmentDate, excludeAppointmentId = null) => {
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
  excludeAppointmentId = null
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
