import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, Patient } from "../../types";
import { baseQuery } from "./baseQuery";
export const patientApi = createApi({
  reducerPath: "patientApi",
  tagTypes: ["Patient"],
  baseQuery,
  endpoints: (builder) => ({
    getPatients: builder.query<Patient[], void>({
      query: () => "patients",
      providesTags: ["Patient"],
      transformResponse: (response: ApiResponse<Patient[]>) => {
        return response.data;
      },
    }),

    getPatientById: builder.query({
      query: (id) => `patients/${id}`,
      providesTags: (_, __, id) => [{ type: "Patient", id }],
      transformResponse: (response: ApiResponse<Patient>) => {
        return response.data;
      },
    }),

    getMyPatientProfile: builder.query<Patient, void>({
      query: () => "patients/me",
      providesTags: ["Patient"],
      transformResponse: (response: ApiResponse<Patient>) => {
        return response.data;
      },
    }),

    updatePatient: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `patients/${id}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (_, __, { id }) => [
        { type: "Patient", id },
        { type: "Patient" },
      ],
    }),
  }),
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useUpdatePatientMutation,
  useGetMyPatientProfileQuery,
} = patientApi;
