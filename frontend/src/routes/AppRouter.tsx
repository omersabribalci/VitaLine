import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../pages/NotFoundPage";

import DashboardLayout from "../layouts/DashboardLayout";

// Admin Pages
import AdminOverview from "../pages/Admin/AdminOverview";
import AdminDoctorList from "../pages/Admin/AdminDoctorList";
import AdminPatientList from "../pages/Admin/AdminPatientList";
import AdminAppointments from "../pages/Admin/AdminAppointments";
import AdminManagement from "../pages/Admin/AdminManagement";
import AdminAddDoctorForm from "../components/Admin/AdminAddDoctorForm";
import AdminEditDoctorForm from "../components/Admin/AdminEditDoctorForm";
import AdminDoctorDetails from "../components/Admin/AdminDoctorDetails";
import AdminPatientDetails from "../components/Admin/AdminPatientDetails";
import AdminAppointmentsDetails from "../components/Admin/AdminAppointmentsDetails";

// Dcotor Pages
import DoctorAppointments from "../pages/Doctor/DoctorAppointments";
import DoctorOverview from "../pages/Doctor/DoctorOverview";
import DoctorManagement from "../pages/Doctor/DoctorManagement";
import DoctorAppointmentDetails from "../components/Doctor/DoctorAppointmentDetails";

// Patient Pages
import PatientOverview from "../pages/Patient/PatientOverview";
import PatientAppointments from "../pages/Patient/PatientAppointments";
import PatientBookAppointment from "../pages/Patient/PatientBookAppointment";
import PatientAppointmentDetails from "../components/Patient/PatientAppointmentDetails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <AdminOverview />,
              },
              {
                path: "doctors",
                element: <AdminDoctorList />,
              },
              {
                path: "addNewDoctor",
                element: <AdminAddDoctorForm />,
              },
              {
                path: "editDoctor/:id",
                element: <AdminEditDoctorForm />,
              },
              {
                path: "doctors/:id",
                element: <AdminDoctorDetails />,
              },
              {
                path: "patients",
                element: <AdminPatientList />,
              },
              {
                path: "patients/:id",
                element: <AdminPatientDetails />,
              },
              {
                path: "appointments",
                element: <AdminAppointments />,
              },
              {
                path: "appointments/:id",
                element: <AdminAppointmentsDetails />,
              },
              {
                path: "management",
                element: <AdminManagement />,
              },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={["doctor"]} />,
        children: [
          {
            path: "/doctor",
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <DoctorOverview />,
              },
              {
                path: "management",
                element: <DoctorManagement />,
              },
              {
                path: "appointments",
                element: <DoctorAppointments />,
              },
              {
                path: "appointments/:id",
                element: <DoctorAppointmentDetails />,
              },
            ],
          },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={["patient"]} />,
        children: [
          {
            path: "/patient",
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <PatientOverview />,
              },
              {
                path: "bookAppointment",
                element: <PatientBookAppointment />,
              },
              {
                path: "appointments",
                element: <PatientAppointments />,
              },
              {
                path: "appointments/:id",
                element: <PatientAppointmentDetails />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
