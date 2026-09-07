import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { toast } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import { server } from "../test/server";
import { authApi } from "../store/services/authApi";
import authReducer from "../store/slices/authSlice";
import LoginPage from "./LoginPage";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const patientUser = {
  _id: "user-1",
  name: "Test Patient",
  email: "patient@test.com",
  phone: "05555555555",
  role: "patient" as const,
};

const renderLoginPage = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(authApi.middleware),
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/patient" element={<h1>Patient dashboard</h1>} />
          <Route path="/doctor" element={<h1>Doctor dashboard</h1>} />
          <Route path="/admin" element={<h1>Admin dashboard</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  return store;
};

describe("LoginPage", () => {
  it("shows client-side validation without calling the backend", async () => {
    let requestCount = 0;
    server.use(
      http.post("http://localhost:5000/api/auth/login", () => {
        requestCount += 1;
        return HttpResponse.json({});
      }),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required!")).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });

  it("stores a successful login and navigates according to the user role", async () => {
    let submittedBody: unknown;
    server.use(
      http.post("http://localhost:5000/api/auth/login", async ({ request }) => {
        submittedBody = await request.json();
        return HttpResponse.json({
          success: true,
          message: "Logged in",
          data: { token: "access-token", user: patientUser },
        });
      }),
    );
    const user = userEvent.setup();
    const store = renderLoginPage();

    await user.type(screen.getByPlaceholderText("E-mail address"), patientUser.email);
    await user.type(screen.getByPlaceholderText("Password"), "Strong123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(
      await screen.findByRole("heading", { name: "Patient dashboard" }),
    ).toBeInTheDocument();
    expect(submittedBody).toEqual({
      email: patientUser.email,
      password: "Strong123",
    });
    expect(store.getState().auth.token).toBe("access-token");
    expect(toast.success).toHaveBeenCalledWith("Welcome, Test Patient");
  });

  it("shows the backend message and stays on login when credentials are wrong", async () => {
    server.use(
      http.post("http://localhost:5000/api/auth/login", () =>
        HttpResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText("E-mail address"), patientUser.email);
    await user.type(screen.getByPlaceholderText("Password"), "Wrong123");
    await user.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
  });
});
