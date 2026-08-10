import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, CredentialsPayload } from "../../types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<CredentialsPayload>) => {
        return response.data;
      },
    }),
    signup: builder.mutation({
      query: (registerInfos) => ({
        url: "auth/register",
        method: "POST",
        body: registerInfos,
      }),
      transformResponse: (response: ApiResponse<unknown>) => {
        return response.data;
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
