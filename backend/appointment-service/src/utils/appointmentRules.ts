const {
  addMinutes,
  differenceInCalendarDays,
  endOfDay,
  getDay,
  isAfter,
  isBefore,
  isWithinInterval,
  startOfDay,
} = require("date-fns");
const {
  getClinicTime,
  toClinicDate,
} = require("./appointmentTime.js");
const AppError = require("./AppError.js");
type DoctorBookingProfile = { unavailableDates: Array<{ start: string; end: string }> };
type BookingPolicyValue = {
  appointmentDurationMinutes: number;
  bookingWindowDays: number;
  workingTimeStart: string;
  workingTimeEnd: string;
  workingDays: number[];
  lunchBreakStart: string | null;
  lunchBreakEnd: string | null;
};

const timeToMinutes = (time: string): number => {
  const parts = time.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
};

const isBookingDayAvailable = (
  targetDate: Date,
  policy: BookingPolicyValue,
  doctor: Pick<DoctorBookingProfile, "unavailableDates">,
  now = new Date(),
) => {
  const clinicTargetDate = toClinicDate(targetDate);
  const targetDay = startOfDay(clinicTargetDate);
  const today = startOfDay(toClinicDate(now));
  if (isBefore(targetDay, today)) return false;
  if (differenceInCalendarDays(targetDay, today) > policy.bookingWindowDays) {
    return false;
  }
  if (!policy.workingDays.includes(getDay(clinicTargetDate))) return false;

  return !doctor.unavailableDates.some((range: { start: string; end: string }) =>
    isWithinInterval(clinicTargetDate, {
      start: startOfDay(toClinicDate(new Date(range.start))),
      end: endOfDay(toClinicDate(new Date(range.end))),
    }),
  );
};

const validateAppointmentSlot = (
  appointmentDate: Date,
  policy: BookingPolicyValue,
  doctor: Pick<DoctorBookingProfile, "unavailableDates">,
  now = new Date(),
) => {
  if (!isAfter(appointmentDate, now)) {
    throw new AppError("Appointment date must be in the future.", 400);
  }

  const clinicAppointmentDate = toClinicDate(appointmentDate);
  const appointmentDay = startOfDay(clinicAppointmentDate);
  const today = startOfDay(toClinicDate(now));
  if (
    differenceInCalendarDays(appointmentDay, today) > policy.bookingWindowDays
  ) {
    throw new AppError(
      `Appointments can only be booked up to ${policy.bookingWindowDays} days in advance.`,
      400,
    );
  }
  if (!policy.workingDays.includes(getDay(clinicAppointmentDate))) {
    throw new AppError(
      "Appointments cannot be booked on non-working days.",
      400,
    );
  }

  const unavailable = doctor.unavailableDates.some((range: { start: string; end: string }) =>
    isWithinInterval(clinicAppointmentDate, {
      start: startOfDay(toClinicDate(new Date(range.start))),
      end: endOfDay(toClinicDate(new Date(range.end))),
    }),
  );
  if (unavailable) {
    throw new AppError(
      "The selected doctor is not available on this date.",
      400,
    );
  }

  const appointmentEnd = addMinutes(
    appointmentDate,
    policy.appointmentDurationMinutes,
  );
  const startTime = getClinicTime(appointmentDate);
  const endTime = getClinicTime(appointmentEnd);
  if (
    startTime < policy.workingTimeStart ||
    endTime > policy.workingTimeEnd
  ) {
    throw new AppError(
      `Appointments must be between ${policy.workingTimeStart} and ${policy.workingTimeEnd}.`,
      400,
    );
  }
  if (
    policy.lunchBreakStart !== null &&
    policy.lunchBreakEnd !== null &&
    startTime < policy.lunchBreakEnd &&
    endTime > policy.lunchBreakStart
  ) {
    throw new AppError(
      "Appointments cannot overlap with the lunch break.",
      400,
    );
  }

  const minutesFromShiftStart =
    timeToMinutes(startTime) - timeToMinutes(policy.workingTimeStart);

  if (
    minutesFromShiftStart % policy.appointmentDurationMinutes !== 0
  ) {
    throw new AppError(
      `Appointment time must align to ${policy.appointmentDurationMinutes}-minute slots.`,
      400,
    );
  }
};

module.exports = { isBookingDayAvailable, validateAppointmentSlot };
