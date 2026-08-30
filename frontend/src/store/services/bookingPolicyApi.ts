import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, AvailabilityPolicy } from "../../types";
import { baseQueryWithReAuth } from "./baseQueryWithReAuth";

export const bookingPolicyApi = createApi({
  reducerPath: "bookingPolicyApi",
  tagTypes: ["BookingPolicy"],
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    getBookingPolicy: builder.query<AvailabilityPolicy, void>({
      query: () => "booking-policy",
      providesTags: ["BookingPolicy"],
      transformResponse: (response: ApiResponse<AvailabilityPolicy>) => {
        return response.data;
      },
    }),
    updateBookingPolicy: builder.mutation<AvailabilityPolicy, Partial<AvailabilityPolicy>>({
      query: (data) => ({
        url: "booking-policy",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["BookingPolicy"],
    }),
  }),
});

export const { useGetBookingPolicyQuery, useUpdateBookingPolicyMutation } = bookingPolicyApi;
