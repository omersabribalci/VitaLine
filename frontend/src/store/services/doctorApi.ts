import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  Doctor,
  PaginatedData,
  PaginationQuery,
} from "../../types";
import { baseQueryWithReAuth } from "./baseQueryWithReAuth";
import { normalizePaginatedData } from "../../utils/pagination";

export type DoctorListQuery = PaginationQuery & {
  search?: string;
  speciality?: string;
  sort?: "name";
};

export type DoctorCatalog = {
  titles: string[];
  specialities: string[];
};

export const doctorApi = createApi({
  reducerPath: "doctorApi",
  tagTypes: ["Doctor", "Speciality"],
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    getDoctorCatalog: builder.query<DoctorCatalog, void>({
      query: () => "doctors/catalog",
      providesTags: ["Speciality"],
      transformResponse: (response: ApiResponse<DoctorCatalog>) => response.data,
    }),

    getAvailableSpecialities: builder.query<string[], void>({
      query: () => "doctors/specialities/available",
      providesTags: ["Speciality"],
      transformResponse: (response: ApiResponse<string[]>) => response.data,
    }),

    getDoctors: builder.query<PaginatedData<Doctor>, DoctorListQuery | void>({
      query: (params) => {
        const query = new URLSearchParams();

        if (params?.search) query.set("search", params.search);
        if (params?.speciality) query.set("speciality", params.speciality);
        if (params?.sort) query.set("sort", params.sort);
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));

        const queryString = query.toString();
        return queryString ? `doctors?${queryString}` : "doctors";
      },
      providesTags: ["Doctor"],
      transformResponse: (
        response: ApiResponse<PaginatedData<Doctor> | Doctor[]>,
      ) => normalizePaginatedData(response.data),
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

    getDoctorsBySpeciality: builder.query<Doctor[], string>({
      query: (speciality) =>
        `doctors?speciality=${encodeURIComponent(speciality)}&sort=name&limit=100`,
      providesTags: (_, __, speciality) => [{ type: "Doctor", id: speciality }],
      transformResponse: (
        response: ApiResponse<PaginatedData<Doctor> | Doctor[]>,
      ) => normalizePaginatedData(response.data).items,
    }),

    addDoctor: builder.mutation({
      query: (newDoctor) => ({
        url: "doctors",
        method: "POST",
        body: newDoctor,
      }),
      invalidatesTags: ["Doctor", "Speciality"],
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
        { type: "Speciality" },
      ],
    }),

    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `doctors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Doctor", "Speciality"],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetDoctorCatalogQuery,
  useGetAvailableSpecialitiesQuery,
  useGetDoctorByIdQuery,
  useGetDoctorsBySpecialityQuery,
  useAddDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
  useGetMyDoctorProfileQuery,
} = doctorApi;
