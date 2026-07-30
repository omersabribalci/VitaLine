import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Patient } from "../../types";

export const patientApi = createApi({
  reducerPath: "patientApi",
  tagTypes: ["Patient"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/",
  }),
  endpoints: (builder) => ({
    getPatients: builder.query<Patient[], void>({
      query: () => "patients",
      providesTags: ["Patient"],
    }),

    getPatientById: builder.query({
      query: (id) => `patients/${id}`,
      providesTags: (_, __, id) => [{ type: "Patient", id }],
    }),

    updatePatient: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `updatePatient/${id}`,
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
} = patientApi;
