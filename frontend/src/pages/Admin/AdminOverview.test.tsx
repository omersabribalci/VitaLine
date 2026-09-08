import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import authReducer from "../../store/slices/authSlice";
import { appointmentApi } from "../../store/services/appointmentApi";
import { server } from "../../test/server";
import AdminOverview from "./AdminOverview";

vi.mock("@mui/x-charts/PieChart", () => ({
  PieChart: () => <div data-testid="appointment-status-chart" />,
}));

const renderPage = () => {
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
      <AdminOverview />
    </Provider>,
  );
};

describe("AdminOverview", () => {
  it("presents backend statistics without a duplicate total appointment card", async () => {
    server.use(
      http.get("http://localhost:5000/api/appointments/statistics", () =>
        HttpResponse.json({
          success: true,
          message: "",
          data: {
            doctorCount: 8,
            patientCount: 42,
            appointmentCount: 17,
            statusCounts: {
              completed: 10,
              cancelled: 2,
              scheduled: 5,
            },
            appointmentsByDoctor: [
              { doctorId: "doctor-1", doctorName: "Ada Doctor", count: 9 },
              { doctorId: "doctor-2", doctorName: "Grace Doctor", count: 4 },
            ],
            appointmentsBySpeciality: [
              { speciality: "Cardiology", count: 11 },
              { speciality: "Neurology", count: 6 },
            ],
          },
        }),
      ),
    );

    renderPage();

    expect(await screen.findByText("Status distribution")).toBeInTheDocument();
    expect(screen.getByText("Registered doctors")).toBeInTheDocument();
    expect(screen.getByText("Registered patients")).toBeInTheDocument();
    expect(screen.getByText("Ada Doctor")).toBeInTheDocument();
    expect(screen.getByText("Cardiology")).toBeInTheDocument();
    expect(screen.getByTestId("appointment-status-chart")).toBeInTheDocument();
    expect(screen.queryByText("Total Appointments")).not.toBeInTheDocument();
  });
});
