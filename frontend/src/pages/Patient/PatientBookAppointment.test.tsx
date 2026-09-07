import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { MemoryRouter, Route, Routes } from "react-router";
import { toast } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import { Provider } from "react-redux";
import type { Doctor, Patient } from "../../types";
import { server } from "../../test/server";
import authReducer, { setCredentials } from "../../store/slices/authSlice";
import { appointmentApi } from "../../store/services/appointmentApi";
import { bookingPolicyApi } from "../../store/services/bookingPolicyApi";
import { doctorApi } from "../../store/services/doctorApi";
import { patientApi } from "../../store/services/patientApi";
import PatientBookAppointment from "./PatientBookAppointment";

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../components/UI/CustomDatePicker", () => ({
  default: ({
    onChange,
    shouldDisableDate,
  }: {
    onChange: (date: Date) => void;
    shouldDisableDate?: (date: Date) => boolean;
  }) => {
    const testDate = new Date(2030, 0, 7);

    return (
      <button
        type="button"
        disabled={shouldDisableDate?.(testDate)}
        onClick={() => onChange(testDate)}
      >
        Choose test date
      </button>
    );
  },
}));

const patient: Patient = {
  _id: "patient-1",
  accountStatus: "enabled",
  userId: {
    _id: "user-1",
    name: "Test Patient",
    email: "patient@test.com",
    phone: "05555555555",
    role: "patient",
  },
};

const doctor: Doctor = {
  _id: "doctor-1",
  title: "Dr.",
  speciality: "Cardiology",
  unavailableDates: [],
  userId: {
    _id: "doctor-user-1",
    name: "Ada Doctor",
    email: "doctor@test.com",
    phone: "05555555556",
    role: "doctor",
  },
};

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      [appointmentApi.reducerPath]: appointmentApi.reducer,
      [bookingPolicyApi.reducerPath]: bookingPolicyApi.reducer,
      [doctorApi.reducerPath]: doctorApi.reducer,
      [patientApi.reducerPath]: patientApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        appointmentApi.middleware,
        bookingPolicyApi.middleware,
        doctorApi.middleware,
        patientApi.middleware,
      ),
  });

const addBaseHandlers = () => {
  server.use(
    http.get("http://localhost:5000/api/patients/me", () =>
      HttpResponse.json({ success: true, message: "", data: patient }),
    ),
    http.get("http://localhost:5000/api/booking-policy", () =>
      HttpResponse.json({
        success: true,
        message: "",
        data: {
          appointmentDurationMinutes: 30,
          bookingWindowDays: 3650,
          workingTimeStart: "09:00",
          workingTimeEnd: "17:00",
          workingDays: [0, 1, 2, 3, 4, 5, 6],
          lunchBreakStart: "12:00",
          lunchBreakEnd: "13:00",
        },
      }),
    ),
    http.get("http://localhost:5000/api/doctors", () =>
      HttpResponse.json({ success: true, message: "", data: [doctor] }),
    ),
    http.get(
      "http://localhost:5000/api/appointments/availability",
      () =>
        HttpResponse.json({
          success: true,
          message: "",
          data: {
            date: "2030-01-07",
            doctorId: doctor._id,
            slots: [{ time: "09:00", isAvailable: true }],
          },
        }),
    ),
  );
};

const renderPage = () => {
  const store = createTestStore();
  store.dispatch(
    setCredentials({ token: "patient-token", user: patient.userId }),
  );

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/patient/book"]}>
        <Routes>
          <Route path="/patient/book" element={<PatientBookAppointment />} />
          <Route path="/patient" element={<h1>Patient home</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

const selectDoctorAndDate = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  expect(
    await screen.findByRole("heading", { name: "Book an Appointment" }),
  ).toBeInTheDocument();
  await user.click(screen.getAllByRole("combobox")[0]!);
  await user.click(await screen.findByRole("option", { name: "Cardiology" }));

  const selects = await screen.findAllByRole("combobox");
  await user.click(selects[1]!);
  await user.click(await screen.findByRole("option", { name: "Ada Doctor" }));
  await user.click(await screen.findByRole("button", { name: "Choose test date" }));
};

describe("PatientBookAppointment", () => {
  it("books a backend-provided slot and navigates to the patient page", async () => {
    addBaseHandlers();
    let submittedAppointment: unknown;
    server.use(
      http.post(
        "http://localhost:5000/api/appointments",
        async ({ request }) => {
          submittedAppointment = await request.json();
          return HttpResponse.json(
            { success: true, message: "Created", data: {} },
            { status: 201 },
          );
        },
      ),
    );
    const user = userEvent.setup();
    renderPage();

    await selectDoctorAndDate(user);
    await user.click(await screen.findByRole("button", { name: "09:00" }));
    await user.click(
      await screen.findByRole("button", { name: "Book Appointment" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Patient home" }),
    ).toBeInTheDocument();
    expect(submittedAppointment).toEqual({
      doctorId: "doctor-1",
      patientId: "patient-1",
      dateAndTime: "2030-01-07T09:00",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Appointment booked successfully!",
    );
  });

  it("shows a retry state when the backend policy cannot be loaded", async () => {
    addBaseHandlers();
    server.use(
      http.get("http://localhost:5000/api/booking-policy", () =>
        HttpResponse.json(
          { success: false, message: "Policy unavailable" },
          { status: 500 },
        ),
      ),
    );
    renderPage();

    expect(
      await screen.findByText("Unable to reach the server, please try again."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeEnabled();
  });

  it("shows an empty state when the backend returns no slots", async () => {
    addBaseHandlers();
    server.use(
      http.get(
        "http://localhost:5000/api/appointments/availability",
        () =>
          HttpResponse.json({
            success: true,
            message: "",
            data: { date: "2030-01-07", doctorId: doctor._id, slots: [] },
          }),
      ),
    );
    const user = userEvent.setup();
    renderPage();

    await selectDoctorAndDate(user);

    expect(
      await screen.findByText("No available slots for this day."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Book Appointment" }),
    ).not.toBeInTheDocument();
  });

  it("shows a conflict message and does not navigate when booking fails", async () => {
    addBaseHandlers();
    server.use(
      http.post("http://localhost:5000/api/appointments", () =>
        HttpResponse.json(
          {
            success: false,
            message: "This time slot is already booked for the selected doctor.",
          },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderPage();

    await selectDoctorAndDate(user);
    await user.click(await screen.findByRole("button", { name: "09:00" }));
    await user.click(
      await screen.findByRole("button", { name: "Book Appointment" }),
    );

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "This time slot is already booked for the selected doctor.",
      ),
    );
    expect(
      screen.getByRole("heading", { name: "Book an Appointment" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Patient home" }),
    ).not.toBeInTheDocument();
  });
});
