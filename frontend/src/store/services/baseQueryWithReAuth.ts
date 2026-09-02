import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { Mutex } from "async-mutex";

import { baseQuery } from "./baseQuery";
import { setCredentials, setUnauthenticated } from "../slices/authSlice";
import type { LoginData } from "../../types";

// Aynı anda sadece bir refresh işlemi yapılmasını sağlar.
const mutex = new Mutex();

export const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Başka bir request refresh yapıyorsa bekle.
  await mutex.waitForUnlock();

  // Normal API request'i gönder.
  let result = await baseQuery(args, api, extraOptions);

  // Access token geçersizse 401 gelir.
  if (result.error && result.error.status === 401) {
    // Şu anda başka bir refresh işlemi yoksa
    // refresh işlemini bu request yapacak.
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await baseQuery(
          {
            url: "auth/refresh",
            method: "POST",
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          const responseData = refreshResult.data as {
            data: LoginData;
          };

          // Yeni access token'ı Redux'a kaydet.
          api.dispatch(setCredentials(responseData.data));

          // Yeni token ile orijinal request'i tekrar gönder.
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh başarısızsa kullanıcıyı logout durumuna geçir.
          api.dispatch(setUnauthenticated());
        }
      } finally {
        // Refresh başarılı veya başarısız olsa bile
        // mutex mutlaka serbest bırakılmalı.
        release();
      }
    } else {
      // Başka bir request refresh yapıyor.
      // Onun tamamlanmasını bekle.
      await mutex.waitForUnlock();

      // Diğer request yeni access token'ı Redux'a yazdı.
      // Şimdi kendi request'imizi tekrar gönder.
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
