import { createApi } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, LoginData, LoginFormData } from "../../types";
import { baseQuery } from "./baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginData, LoginFormData>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<LoginData>) => {
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
    refresh: builder.mutation<LoginData, void>({
      query: () => ({
        url: "auth/refresh",
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<LoginData>) => {
        return response.data;
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;
