import { configureStore } from "@reduxjs/toolkit";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import type { AvailabilityPolicy } from "../../types";
import authReducer, { setCredentials } from "../slices/authSlice";
import { server } from "../../test/server";
import { bookingPolicyApi } from "./bookingPolicyApi";

const policy: AvailabilityPolicy = {
  appointmentDurationMinutes: 30,
  bookingWindowDays: 21,
  workingTimeStart: "09:00",
  workingTimeEnd: "17:00",
  workingDays: [1, 2, 3, 4, 5],
  lunchBreakStart: "12:00",
  lunchBreakEnd: "13:00",
};

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [bookingPolicyApi.reducerPath]: bookingPolicyApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(bookingPolicyApi.middleware),
  });

const patientUser = {
  _id: "user-1",
  name: "Test Patient",
  email: "patient@test.com",
  phone: "05555555555",
  role: "patient" as const,
};

describe("bookingPolicyApi", () => {
  it("sends the access token and extracts policy data from the API envelope", async () => {
    let authorizationHeader: string | null = null;

    server.use(
      http.get("http://localhost:5000/api/booking-policy", ({ request }) => {
        authorizationHeader = request.headers.get("Authorization");

        return HttpResponse.json({
          success: true,
          message: "",
          data: policy,
        });
      }),
    );

    const store = createTestStore();
    store.dispatch(
      setCredentials({
        token: "test-access-token",
        user: patientUser,
      }),
    );

    const request = store.dispatch(
      bookingPolicyApi.endpoints.getBookingPolicy.initiate(),
    );
    const result = await request.unwrap();
    request.unsubscribe();

    expect(authorizationHeader).toBe("Bearer test-access-token");
    expect(result).toEqual(policy);
  });

  it("refreshes an expired access token and retries the original request", async () => {
    const authorizationHeaders: Array<string | null> = [];
    server.use(
      http.get("http://localhost:5000/api/booking-policy", ({ request }) => {
        const authorization = request.headers.get("Authorization");
        authorizationHeaders.push(authorization);

        if (authorization === "Bearer old-token") {
          return HttpResponse.json(
            { success: false, message: "Access token expired" },
            { status: 401 },
          );
        }

        return HttpResponse.json({
          success: true,
          message: "",
          data: policy,
        });
      }),
      http.post("http://localhost:5000/api/auth/refresh", () =>
        HttpResponse.json({
          success: true,
          message: "Refreshed",
          data: { token: "new-token", user: patientUser },
        }),
      ),
    );
    const store = createTestStore();
    store.dispatch(setCredentials({ token: "old-token", user: patientUser }));

    const request = store.dispatch(
      bookingPolicyApi.endpoints.getBookingPolicy.initiate(),
    );
    const result = await request.unwrap();
    request.unsubscribe();

    expect(result).toEqual(policy);
    expect(authorizationHeaders).toEqual([
      "Bearer old-token",
      "Bearer new-token",
    ]);
    expect(store.getState().auth.token).toBe("new-token");
  });

  it("clears authentication when refreshing the token fails", async () => {
    server.use(
      http.get("http://localhost:5000/api/booking-policy", () =>
        HttpResponse.json(
          { success: false, message: "Access token expired" },
          { status: 401 },
        ),
      ),
      http.post("http://localhost:5000/api/auth/refresh", () =>
        HttpResponse.json(
          { success: false, message: "No refresh token" },
          { status: 401 },
        ),
      ),
    );
    const store = createTestStore();
    store.dispatch(setCredentials({ token: "old-token", user: patientUser }));

    const request = store.dispatch(
      bookingPolicyApi.endpoints.getBookingPolicy.initiate(),
    );

    await expect(request.unwrap()).rejects.toMatchObject({ status: 401 });
    request.unsubscribe();
    expect(store.getState().auth).toMatchObject({
      token: null,
      user: null,
      isAuthenticated: false,
      authStatus: "unauthenticated",
    });
    expect(localStorage.getItem("user")).toBeNull();
  });
});
