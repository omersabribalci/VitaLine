import { useCallback } from "react";
import { buildAppointmentObject } from "../utils/appointmentUtils";
import type { BookAppointmentFormData } from "../types";

export const useAppointmentForm = (
  newAppointmentMutation: (arg: unknown) => { unwrap: () => Promise<unknown> },
  selectedDoctorId: string,
  patientId: string | undefined,
) => {
  const onSubmit = useCallback(
    async (formData: BookAppointmentFormData) => {
      try {
        const appointmentObject = buildAppointmentObject(
          formData,
          selectedDoctorId,
          patientId ?? "",
        );

        await newAppointmentMutation(appointmentObject).unwrap();
        return { success: true };
      } catch (err) {
        console.error("Randevu alınırken bir hata oluştu.", err);
        return { success: false, error: err };
      }
    },
    [newAppointmentMutation, selectedDoctorId, patientId],
  );

  return onSubmit;
};
