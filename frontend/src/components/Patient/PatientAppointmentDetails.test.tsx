import { configureStore } from "@reduxjs/toolkit";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { toast } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import { server } from "../../test/server";
import { appointmentApi } from "../../store/services/appointmentApi";
import authReducer from "../../store/slices/authSlice";
import PatientAppointmentDetails from "./PatientAppointmentDetails";

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const appointment = {
  _id: "appointment-1",
  dateAndTime: "2030-01-07T10:00:00.000Z",
  status: "scheduled",
  patientId: {
    _id: "patient-1",
    accountStatus: "enabled",
    userId: {
      _id: "patient-user-1",
      name: "Test Patient",
      email: "patient@test.com",
      phone: "05555555555",
      role: "patient",
    },
  },
  doctorId: {
    _id: "doctor-1",
    title: "Dr.",
    speciality: "Cardiology",
    unavailableDates: [],
    userId: {
      _id: "doctor-user-1",
      name: "Test Doctor",
      email: "doctor@test.com",
      phone: "05555555554",
      role: "doctor",
    },
  },
};

const renderDetails = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [appointmentApi.reducerPath]: appointmentApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(appointmentApi.middleware),
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/patient/appointments/appointment-1"]}>
        <Routes>
          <Route
            path="/patient/appointments/:id"
            element={<PatientAppointmentDetails />}
          />
          <Route
            path="/patient/appointments"
            element={<h1>Appointments destination</h1>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("PatientAppointmentDetails", () => {
  it("shows success feedback and returns to the list after cancellation", async () => {
    let submittedBody: unknown;

    server.use(
      http.get(
        "http://localhost:5000/api/appointments/appointment-1",
        () => HttpResponse.json({ success: true, data: appointment }),
      ),
      http.patch(
        "http://localhost:5000/api/appointments/appointment-1",
        async ({ request }) => {
          submittedBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: { ...appointment, status: "cancelled" },
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderDetails();

    await screen.findByText("Test Patient");
    await user.click(
      screen.getByRole("button", { name: "Cancel Appointment" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Cancel Appointment" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Appointments destination" }),
    ).toBeInTheDocument();
    expect(submittedBody).toEqual({ status: "cancelled" });
    expect(toast.success).toHaveBeenCalledWith(
      "Appointment cancelled successfully!",
    );
  });
});
