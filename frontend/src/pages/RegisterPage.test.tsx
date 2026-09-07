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
import RegisterPage from "./RegisterPage";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const renderRegisterPage = () => {
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
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<h1>Login destination</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const fillRegistration = async (
  user: ReturnType<typeof userEvent.setup>,
  confirmPassword = "Strong123",
) => {
  await user.type(screen.getByPlaceholderText("Full Name"), "Test Patient");
  await user.type(
    screen.getByPlaceholderText("E-mail address"),
    "patient@test.com",
  );
  await user.type(screen.getByPlaceholderText("Phone Number"), "05555555555");
  await user.type(screen.getByPlaceholderText("Password"), "Strong123");
  await user.type(screen.getByPlaceholderText("Confirm password"), confirmPassword);
};

describe("RegisterPage", () => {
  it("prevents submission when password confirmation does not match", async () => {
    let requestCount = 0;
    server.use(
      http.post("http://localhost:5000/api/auth/register", () => {
        requestCount += 1;
        return HttpResponse.json({});
      }),
    );
    const user = userEvent.setup();
    renderRegisterPage();
    await fillRegistration(user, "Different123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });

  it("submits registration data and navigates to login", async () => {
    let submittedBody: unknown;
    server.use(
      http.post("http://localhost:5000/api/auth/register", async ({ request }) => {
        submittedBody = await request.json();
        return HttpResponse.json(
          { success: true, message: "Created", data: {} },
          { status: 201 },
        );
      }),
    );
    const user = userEvent.setup();
    renderRegisterPage();
    await fillRegistration(user);

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(
      await screen.findByRole("heading", { name: "Login destination" }),
    ).toBeInTheDocument();
    expect(submittedBody).toEqual({
      name: "Test Patient",
      email: "patient@test.com",
      phone: "05555555555",
      password: "Strong123",
      confirmPassword: "Strong123",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Account created successfully 🎉",
    );
  });
});
