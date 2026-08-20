import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { baseQuery } from "./baseQuery";
import { setCredentials, setUnauthenticated } from "../slices/authSlice";
import type { LoginData } from "../../types";

export const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await baseQuery(
      { url: "auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const responseData = refreshResult.data as { data: LoginData };
      api.dispatch(setCredentials(responseData.data));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(setUnauthenticated());
    }
  }

  return result;
};
