const {
  formatInTimeZone,
  fromZonedTime,
  toZonedTime,
} = require("date-fns-tz");

const APPOINTMENT_TIME_ZONE = "Europe/Istanbul";

const clinicDateTimeToUtc = (date: string, time: string): Date =>
  fromZonedTime(`${date}T${time}:00`, APPOINTMENT_TIME_ZONE);

const toClinicDate = (date: Date): Date =>
  toZonedTime(date, APPOINTMENT_TIME_ZONE);

const getClinicDateKey = (date: Date): string =>
  formatInTimeZone(date, APPOINTMENT_TIME_ZONE, "yyyy-MM-dd");

const getClinicTime = (date: Date): string =>
  formatInTimeZone(date, APPOINTMENT_TIME_ZONE, "HH:mm");

module.exports = {
  APPOINTMENT_TIME_ZONE,
  clinicDateTimeToUtc,
  toClinicDate,
  getClinicDateKey,
  getClinicTime,
};
