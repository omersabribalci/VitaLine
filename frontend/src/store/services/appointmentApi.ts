import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  AdminStatistics,
  Appointment,
  AvailabilityResponse,
  PaginatedData,
  PaginationQuery,
} from "../../types";
import { baseQueryWithReAuth } from "./baseQueryWithReAuth";
import { normalizePaginatedData } from "../../utils/pagination";

type ScopedAppointmentQuery = PaginationQuery & {
  doctorId?: string;
  patientId?: string;
};

const appointmentListQuery = (params?: ScopedAppointmentQuery) => ({
  url: "appointments",
  params,
});

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

    getAllAppointments: builder.query<
      PaginatedData<Appointment>,
      PaginationQuery | void
    >({
      query: (params) => appointmentListQuery(params || undefined),
      providesTags: [{ type: "Appointment", id: "LIST" }],
      transformResponse: (
        response: ApiResponse<PaginatedData<Appointment> | Appointment[]>,
      ) => normalizePaginatedData(response.data),
    }),

    getAppointmentsByDoctorId: builder.query<
      PaginatedData<Appointment>,
      PaginationQuery & { doctorId: string }
    >({
      query: (params) => appointmentListQuery(params),
      providesTags: (_, __, { doctorId }) => [
        { type: "Appointment", id: doctorId },
      ],
      transformResponse: (
        response: ApiResponse<PaginatedData<Appointment> | Appointment[]>,
      ) => normalizePaginatedData(response.data),
    }),

    getAppointmentsByPatientId: builder.query<
      PaginatedData<Appointment>,
      PaginationQuery & { patientId: string }
    >({
      query: (params) => appointmentListQuery(params),
      providesTags: (_, __, { patientId }) => [
        { type: "Appointment", id: patientId },
      ],
      transformResponse: (
        response: ApiResponse<PaginatedData<Appointment> | Appointment[]>,
      ) => normalizePaginatedData(response.data),
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
