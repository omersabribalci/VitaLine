import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import type { Role } from "../types";
import authReducer, { setCredentials } from "../store/slices/authSlice";
import ProtectedRoute from "./ProtectedRoute";

const renderRoute = (role?: Role) => {
  const store = configureStore({ reducer: { auth: authReducer } });

  if (role) {
    store.dispatch(
      setCredentials({
        token: "test-token",
        user: {
          _id: "user-1",
          name: "Test User",
          email: "user@test.com",
          phone: "05555555555",
          role,
        },
      }),
    );
  }

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/patient"]}>
        <Routes>
          <Route path="/login" element={<h1>Login page</h1>} />
          <Route path="/" element={<h1>Home page</h1>} />
          <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
            <Route path="/patient" element={<h1>Patient dashboard</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("ProtectedRoute", () => {
  it("redirects an unauthenticated visitor to login", () => {
    renderRoute();

    expect(screen.getByRole("heading", { name: "Login page" })).toBeInTheDocument();
  });

  it("redirects an authenticated user with the wrong role to home", () => {
    renderRoute("doctor");

    expect(screen.getByRole("heading", { name: "Home page" })).toBeInTheDocument();
  });

  it("renders the protected content for an allowed role", () => {
    renderRoute("patient");

    expect(
      screen.getByRole("heading", { name: "Patient dashboard" }),
    ).toBeInTheDocument();
  });
});
