import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Provider } from "react-redux";
import { toast } from "react-toastify";
import { describe, expect, it, vi } from "vitest";
import type { Doctor } from "../../types";
import { server } from "../../test/server";
import authReducer from "../../store/slices/authSlice";
import { doctorApi } from "../../store/services/doctorApi";
import DoctorSetHoliday from "./DoctorSetHoliday";

const { selectedDates } = vi.hoisted(() => ({
  selectedDates: {
    start: new Date(2030, 0, 7),
    end: new Date(2030, 0, 8),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../UI/CustomDatePicker", () => ({
  default: ({
    label,
    onChange,
  }: {
    label: string;
    onChange: (date: Date) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange(label === "Start Date" ? selectedDates.start : selectedDates.end)
      }
    >
      Choose {label}
    </button>
  ),
}));

const doctor: Doctor = {
  _id: "doctor-1",
  title: "Dr.",
  speciality: "Cardiology",
  unavailableDates: [],
  userId: {
    _id: "doctor-user-1",
    name: "Test Doctor",
    email: "doctor@test.com",
    phone: "05555555555",
    role: "doctor",
  },
};

const renderHolidayForm = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      [doctorApi.reducerPath]: doctorApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(doctorApi.middleware),
  });

  render(
    <Provider store={store}>
      <DoctorSetHoliday doctor={doctor} doctorId={doctor._id} />
    </Provider>,
  );
};

describe("DoctorSetHoliday", () => {
  it("sends the selected holiday range to the backend", async () => {
    selectedDates.start = new Date(2030, 0, 7);
    selectedDates.end = new Date(2030, 0, 8);
    let submittedBody: unknown;
    server.use(
      http.patch(
        "http://localhost:5000/api/doctors/doctor-1",
        async ({ request }) => {
          submittedBody = await request.json();
          return HttpResponse.json({ success: true, message: "", data: doctor });
        },
      ),
    );
    const user = userEvent.setup();
    renderHolidayForm();

    await user.click(screen.getByRole("button", { name: "Choose Start Date" }));
    await user.click(screen.getByRole("button", { name: "Choose End Date" }));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() =>
      expect(submittedBody).toEqual({
        unavailableDates: [
          {
            start: selectedDates.start.toISOString(),
            end: selectedDates.end.toISOString(),
          },
        ],
      }),
    );
    expect(toast.success).toHaveBeenCalledWith(
      "Doctor holiday added successfully!",
    );
  });

  it("shows validation feedback when the end date is before the start date", async () => {
    selectedDates.start = new Date(2030, 0, 8);
    selectedDates.end = new Date(2030, 0, 7);
    let requestCount = 0;
    server.use(
      http.patch("http://localhost:5000/api/doctors/doctor-1", () => {
        requestCount += 1;
        return HttpResponse.json({ success: true, message: "", data: doctor });
      }),
    );
    const user = userEvent.setup();
    renderHolidayForm();

    await user.click(screen.getByRole("button", { name: "Choose Start Date" }));
    await user.click(screen.getByRole("button", { name: "Choose End Date" }));
    await user.click(screen.getByRole("button", { name: "Save Changes" }));

    expect(
      await screen.findByText("End Date must be later than Start Date."),
    ).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });
});
