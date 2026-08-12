import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse, LoginData, LoginFormData } from "../../types";
import type { RootState } from "../store";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      console.log("Header için alınan token:", token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
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
    refresh: builder.mutation<{ token: string }, void>({
      query: () => ({
        url: "auth/refresh",
        method: "POST",
        credentials: "include", // Cookie'lerin tarayıcı tarafından gönderilmesi için.
      }),
      transformResponse: (response: ApiResponse<{ token: string }>) => {
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
