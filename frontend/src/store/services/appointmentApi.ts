import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Appointment } from "../../types";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  tagTypes: ["Appointment"],
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001/" }),
  endpoints: (builder) => ({
    newAppointment: builder.mutation({
      query: (newAppointment) => ({
        url: "newAppointment",
        method: "POST",
        body: newAppointment,
      }),
      invalidatesTags: ["Appointment"],
    }),

    getAllAppointments: builder.query<Appointment[], void>({
      query: () => "appointments",
      providesTags: ["Appointment"],
    }),

    getAppointmentsByDoctorId: builder.query({
      query: (doctorId) => `appointments?doctorId=${doctorId}`,
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
    }),

    getAppointmentsByPatientId: builder.query({
      query: (patientId) => `appointments?patientId=${patientId}`,
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
    }),

    getAppointmentById: builder.query({
      query: (id) => `appointments/${id}`,
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
    }),

    updateAppointment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `updateAppointment/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Appointment", id }],
    }),
  }),
});

export const {
  useNewAppointmentMutation,
  useGetAppointmentsByDoctorIdQuery,
  useGetAppointmentsByPatientIdQuery,
  useGetAllAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useUpdateAppointmentMutation,
} = appointmentApi;
