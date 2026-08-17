import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, Doctor } from "../../types";
import { baseQuery } from "./baseQuery";
export const doctorApi = createApi({
  reducerPath: "doctorApi",
  tagTypes: ["Doctor"],
  baseQuery,
  endpoints: (builder) => ({
    getDoctors: builder.query<Doctor[], void>({
      query: () => "doctors",
      providesTags: ["Doctor"],
      transformResponse: (response: ApiResponse<Doctor[]>) => {
        return response.data;
      },
    }),

    getDoctorById: builder.query({
      query: (id) => `doctors/${id}`,
      providesTags: (_, __, id) => [{ type: "Doctor", id }],
      transformResponse: (response: ApiResponse<Doctor>) => {
        return response.data;
      },
    }),

    getDoctorsBySpeciality: builder.query({
      query: (speciality) => `doctors?speciality=${speciality}`,
      providesTags: (_, __, speciality) => [{ type: "Doctor", id: speciality }],
      transformResponse: (response: ApiResponse<Doctor[]>) => {
        return response.data;
      },
    }),

    addDoctor: builder.mutation({
      query: (newDoctor) => ({
        url: "doctors",
        method: "POST",
        body: newDoctor,
      }),
      invalidatesTags: ["Doctor"],
    }),

    updateDoctor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `doctors/${id}`,
        method: "PATCH",
        body: data,
      }),

      invalidatesTags: (_, __, { id }) => [
        { type: "Doctor", id },
        { type: "Doctor" },
      ],
    }),

    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `doctors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Doctor"],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorsBySpecialityQuery,
  useAddDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorApi;
