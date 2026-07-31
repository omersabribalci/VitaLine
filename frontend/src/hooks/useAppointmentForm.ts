import { useCallback } from "react";
import { useSelector } from "react-redux";
import { buildAppointmentObject } from "../utils/appointmentUtils";
import { useNavigate } from "react-router";
import type { RootState } from "../store/store";
import type { BookAppointmentFormData, Doctor } from "../types";

export const useAppointmentForm = (
  newAppointmentMutation: (arg: unknown) => { unwrap: () => Promise<unknown> },
  selectedDoctorId: string,
  _selectedDoctor: Doctor,
  doctorName: string,
  speciality: string,
) => {
  const { id: patientId, name: patientName } = useSelector(
    (state: RootState) => state.auth as { id: string; name: string },
  );

  const navigate = useNavigate();

  const onSubmit = useCallback(
    async (formData: BookAppointmentFormData) => {
      try {
        const appointmentObject = buildAppointmentObject(
          formData,
          selectedDoctorId,
          patientId ?? "",
          doctorName,
          patientName ?? "",
          speciality,
        );

        await newAppointmentMutation(appointmentObject).unwrap();
        navigate("/patient");
        return { success: true };
      } catch (err) {
        console.error("Randevu alınırken bir hata oluştu.", err);
        return { success: false, error: err };
      }
    },
    [
      newAppointmentMutation,
      selectedDoctorId,
      patientId,
      doctorName,
      patientName,
      speciality,
      navigate,
    ],
  );

  return onSubmit;
};
