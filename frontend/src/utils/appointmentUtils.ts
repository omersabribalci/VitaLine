import { format, set } from "date-fns";
import { DATETIME_FORMAT } from "../data/appointmentConstants";
import type { BookAppointmentFormData } from "../types";

/**
 * Converts time string (HH:mm) and date to a formatted datetime
 */
export const createAppointmentDateTime = (date: Date, time: string): string => {
  const [hours, minutes] = time.split(":");
  const appointmentDate = set(new Date(date), {
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: 0,
    milliseconds: 0,
  });

  return format(appointmentDate, DATETIME_FORMAT);
};

/**
 * Creates appointment object from form data
 */
export const buildAppointmentObject = (
  formData: BookAppointmentFormData,
  selectedDoctorId: string,
  patientId: string,
  doctorName: string,
  patientName: string,
  speciality: string,
) => {
  const dateAndTime = createAppointmentDateTime(formData.date!, formData.time!);

  return {
    doctorId: selectedDoctorId,
    patientId,
    doctorName,
    patientName,
    speciality,
    dateAndTime,
    status: "scheduled" as const,
  };
};
