import { useCallback } from "react";
import { format, parse } from "date-fns";
import { DATE_FORMAT, TIME_FORMAT } from "../data/appointmentConstants";
import type { Appointment } from "../types";

export const useTimeBooking = (appointmentsByDoctorId: Appointment[] | undefined, date: Date | null) => {
  const isTimeBooked = useCallback(
    (timeSlot: string) => {
      if (!appointmentsByDoctorId || !date) return false;

      const formattedDate = format(new Date(date), DATE_FORMAT);
      const currentSlotDateTime = `${formattedDate}T${timeSlot}`;

      const now = new Date();

      const slotDate = parse(timeSlot, TIME_FORMAT, new Date(date));

      if (format(now, DATE_FORMAT) === formattedDate && now >= slotDate) {
        return true;
      }

      return appointmentsByDoctorId.some(
        (app: Appointment) =>
          app.dateAndTime === currentSlotDateTime && app.status !== "cancelled",
      );
    },
    [appointmentsByDoctorId, date],
  );

  return isTimeBooked;
};
