import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.ts";
import { doctorApi } from "./services/doctorApi.ts";
import { patientApi } from "./services/patientApi.ts";
import { authApi } from "./services/authApi.ts";
import { appointmentApi } from "./services/appointmentApi.ts";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [doctorApi.reducerPath]: doctorApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [appointmentApi.reducerPath]: appointmentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      doctorApi.middleware,
      patientApi.middleware,
      appointmentApi.middleware,
    ),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
