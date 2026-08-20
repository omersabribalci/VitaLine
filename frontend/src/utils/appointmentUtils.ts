import { format, set } from "date-fns";
import { DATETIME_FORMAT } from "../data/appointmentConstants";
import type { BookAppointmentFormData } from "../types";

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
