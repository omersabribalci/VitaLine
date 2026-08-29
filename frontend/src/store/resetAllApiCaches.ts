import type { AppDispatch } from "./store";
import { authApi } from "./services/authApi";
import { doctorApi } from "./services/doctorApi";
import { patientApi } from "./services/patientApi";
import { appointmentApi } from "./services/appointmentApi";

export const resetAllApiCaches = (dispatch: AppDispatch) => {
  dispatch(authApi.util.resetApiState());
  dispatch(doctorApi.util.resetApiState());
  dispatch(patientApi.util.resetApiState());
  dispatch(appointmentApi.util.resetApiState());
};
