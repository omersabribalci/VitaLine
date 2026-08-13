import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, Appointment } from "../../types";
import { baseQuery } from "./baseQuery";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  tagTypes: ["Appointment"],
  baseQuery,
  endpoints: (builder) => ({
    newAppointment: builder.mutation({
      query: (newAppointment) => ({
        url: "appointments",
        method: "POST",
        body: newAppointment,
      }),
      invalidatesTags: ["Appointment"],
    }),

    getAllAppointments: builder.query<Appointment[], void>({
      query: () => "appointments",
      providesTags: ["Appointment"],
      transformResponse: (response: ApiResponse<Appointment[]>) => {
        return response.data;
      },
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
        url: `appointments/${id}`,
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
