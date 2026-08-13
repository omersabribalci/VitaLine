import { createApi } from "@reduxjs/toolkit/query/react";
import type { Patient } from "../../types";
import { baseQuery } from "./baseQuery";
export const patientApi = createApi({
  reducerPath: "patientApi",
  tagTypes: ["Patient"],
  baseQuery,
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
} = patientApi;
