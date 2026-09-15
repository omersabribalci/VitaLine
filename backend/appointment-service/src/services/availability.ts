const { addMinutes, isAfter, isBefore } = require("date-fns");
const Appointment = require("../models/Appointment.js");
const BookingPolicy = require("../models/BookingPolicy.js");
const doctorClient = require("../clients/doctorClient.js");
const { isBookingDayAvailable } = require("../utils/appointmentRules.js");
const {
  clinicDateTimeToUtc,
  getClinicTime,
} = require("../utils/appointmentTime.js");
const AppError = require("../utils/AppError.js");

const overlapsLunch = (start: string, end: string, policy: any) =>
  policy.lunchBreakStart !== null &&
  policy.lunchBreakEnd !== null &&
  start < policy.lunchBreakEnd &&
  end > policy.lunchBreakStart;

const getAvailability = async (
  doctorId: string,
  date: string,
  requestId: string,
) => {
  const [doctor, policy] = await Promise.all([
    doctorClient.getById(doctorId, requestId),
    BookingPolicy.getPolicy(),
  ]);
  if (!doctor) {
    throw new AppError("Doctor profile not found.", 404);
  }

  const now = new Date();
  const targetDate = clinicDateTimeToUtc(date, "00:00");
  if (!isBookingDayAvailable(targetDate, policy, doctor, now)) {
    return { date, doctorId, slots: [] };
  }

  const appointments = await Appointment.find({
    doctorId,
    bookingDateKey: date,
    status: "scheduled",
    isDeleted: false,
  })
    .select("dateAndTime")
    .lean();
  const bookedTimes = new Set(
    appointments.map((item: any) => getClinicTime(item.dateAndTime)),
  );

  const workEnd = clinicDateTimeToUtc(date, policy.workingTimeEnd);
  let cursor = clinicDateTimeToUtc(date, policy.workingTimeStart);
  const slots: Array<{ time: string; isAvailable: boolean }> = [];

  while (isBefore(cursor, workEnd)) {
    const slotEnd = addMinutes(cursor, policy.appointmentDurationMinutes);
    if (isAfter(slotEnd, workEnd)) break;

    const time = getClinicTime(cursor);
    const endTime = getClinicTime(slotEnd);
    if (!overlapsLunch(time, endTime, policy)) {
      slots.push({
        time,
        isAvailable: !bookedTimes.has(time) && isAfter(cursor, now),
      });
    }
    cursor = slotEnd;
  }

  return { date, doctorId, slots };
};

module.exports = { getAvailability };
