import { useCallback } from "react";
import { buildAppointmentObject } from "../utils/appointmentUtils";
import { useNavigate } from "react-router";
import type { BookAppointmentFormData } from "../types";

export const useAppointmentForm = (
  newAppointmentMutation: (arg: unknown) => { unwrap: () => Promise<unknown> },
  selectedDoctorId: string,
  patientId: string | undefined,
) => {
  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (formData: BookAppointmentFormData) => {
      try {
        const appointmentObject = buildAppointmentObject(
          formData,
          selectedDoctorId,
          patientId ?? "",
        );

        await newAppointmentMutation(appointmentObject).unwrap();
        navigate("/patient");
        return { success: true };
      } catch (err) {
        console.error("Randevu alınırken bir hata oluştu.", err);
        return { success: false, error: err };
      }
    },
    [newAppointmentMutation, selectedDoctorId, patientId, navigate],
  );

  return onSubmit;
};
