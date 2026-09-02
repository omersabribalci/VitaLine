import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, Doctor } from "../../types";
import { baseQueryWithReAuth } from "./baseQueryWithReAuth";

export type DoctorListQuery = {
  search?: string;
  speciality?: string;
  sort?: "name";
};

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  tagTypes: ["Doctor"],
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    getDoctors: builder.query<Doctor[], DoctorListQuery | void>({
      query: (params) => {
        const query = new URLSearchParams();

        if (params?.search) query.set("search", params.search);
        if (params?.speciality) query.set("speciality", params.speciality);
        if (params?.sort) query.set("sort", params.sort);

        const queryString = query.toString();
        return queryString ? `doctors?${queryString}` : "doctors";
      },
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

    getMyDoctorProfile: builder.query<Doctor, void>({
      query: () => "doctors/me",
      providesTags: ["Doctor"],
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
  useGetMyDoctorProfileQuery,
} = doctorApi;
