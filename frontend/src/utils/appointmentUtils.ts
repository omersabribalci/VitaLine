import { format } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  APPOINTMENT_TIME_ZONE,
  DATE_FORMAT,
} from "../data/appointmentConstants";
import type { BookAppointmentFormData } from "../types";

export const createAppointmentDateTime = (date: Date, time: string): string => {
  const selectedDate = format(date, DATE_FORMAT);
  const clinicDateAndTime = `${selectedDate}T${time}:00`;

  return fromZonedTime(clinicDateAndTime, APPOINTMENT_TIME_ZONE).toISOString();
};

export const formatAppointmentDateTime = (value: string): string =>
  formatInTimeZone(value, APPOINTMENT_TIME_ZONE, "dd.MM.yyyy HH:mm");

export const formatAppointmentDate = (value: string): string =>
  formatInTimeZone(value, APPOINTMENT_TIME_ZONE, "dd,MM,yyyy");

export const formatAppointmentTime = (value: string): string =>
  formatInTimeZone(value, APPOINTMENT_TIME_ZONE, "HH:mm");

// Date picker takvim günüyle çalışır. İstanbul'daki bugünün yıl/ay/gün
// parçalarını browser'ın gösterebileceği yerel bir Date nesnesine dönüştürür.
export const getClinicToday = (now = new Date()): Date => {
  const clinicDate = formatInTimeZone(now, APPOINTMENT_TIME_ZONE, DATE_FORMAT);
  const [year, month, day] = clinicDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const buildAppointmentObject = (
  formData: BookAppointmentFormData,
  selectedDoctorId: string,
  patientId: string,
) => {
  const dateAndTime = createAppointmentDateTime(formData.date!, formData.time!);

  return {
    doctorId: selectedDoctorId,
    patientId,
    dateAndTime,
  };
};
