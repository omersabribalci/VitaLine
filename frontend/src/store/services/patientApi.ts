import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  PaginatedData,
  PaginationQuery,
  Patient,
} from "../../types";
import { baseQueryWithReAuth } from "./baseQueryWithReAuth";
import { normalizePaginatedData } from "../../utils/pagination";
export const patientApi = createApi({
  reducerPath: "patientApi",
  tagTypes: ["Patient"],
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    getPatients: builder.query<PaginatedData<Patient>, PaginationQuery | void>({
      query: (params) => ({ url: "patients", params: params || undefined }),
      providesTags: ["Patient"],
      transformResponse: (
        response: ApiResponse<PaginatedData<Patient> | Patient[]>,
      ) => normalizePaginatedData(response.data),
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
