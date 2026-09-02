import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  AdminStatistics,
  Appointment,
  AvailabilityResponse,
} from "../../types";
import { baseQueryWithReAuth } from "./baseQueryWithReAuth";

export const appointmentApi = createApi({
  reducerPath: "appointmentApi",
  tagTypes: ["Appointment"],
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    getAdminStatistics: builder.query<AdminStatistics, void>({
      query: () => "appointments/statistics",
      providesTags: [{ type: "Appointment", id: "STATISTICS" }],
      transformResponse: (response: ApiResponse<AdminStatistics>) =>
        response.data,
    }),
    newAppointment: builder.mutation({
      query: (newAppointment) => ({
        url: "appointments",
        method: "POST",
        body: newAppointment,
      }),
      invalidatesTags: (_, __, { doctorId, patientId }) => [
        { type: "Appointment", id: "LIST" },
        { type: "Appointment", id: doctorId },
        { type: "Appointment", id: patientId },
      ],
    }),

    getAllAppointments: builder.query<Appointment[], void>({
      query: () => "appointments",
      providesTags: [{ type: "Appointment", id: "LIST" }],
      transformResponse: (response: ApiResponse<Appointment[]>) => {
        return response.data;
      },
    }),

    getAppointmentsByDoctorId: builder.query({
      query: (doctorId) => `appointments?doctorId=${doctorId}`,
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
      transformResponse: (response: ApiResponse<Appointment[]>) => {
        return response.data;
      },
    }),

    getAppointmentsByPatientId: builder.query({
      query: (patientId) => `appointments?patientId=${patientId}`,
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
      transformResponse: (response: ApiResponse<Appointment[]>) => {
        return response.data;
      },
    }),

    getAppointmentById: builder.query({
      query: (id) => `appointments/${id}`,
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
      transformResponse: (response: ApiResponse<Appointment>) => {
        return response.data;
      },
    }),

    updateAppointment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `appointments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Appointment", id }],
    }),

    getAvailability: builder.query<
      AvailabilityResponse,
      { doctorId: string; date: string }
    >({
      query: ({ doctorId, date }) =>
        `appointments/availability?doctorId=${doctorId}&date=${date}`,
      providesTags: (_, __, { doctorId }) => [
        { type: "Appointment", id: doctorId },
      ],
      transformResponse: (response: ApiResponse<AvailabilityResponse>) =>
        response.data,
    }),
  }),
});

export const {
  useGetAdminStatisticsQuery,
  useNewAppointmentMutation,
  useGetAppointmentsByDoctorIdQuery,
  useGetAppointmentsByPatientIdQuery,
  useGetAllAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useUpdateAppointmentMutation,
  useGetAvailabilityQuery,
} = appointmentApi;
