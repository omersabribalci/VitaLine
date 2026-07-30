import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import NotFoundPage from "../pages/NotFoundPage";
import AdminOverview from "../pages/Admin/AdminOverview";
import AdminDoctorList from "../pages/Admin/AdminDoctorList";
import AdminPatientList from "../pages/Admin/AdminPatientList";
import AdminAppointments from "../pages/Admin/AdminAppointments";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import DoctorDashboardLayout from "../layouts/DoctorDashboardLayout";
import DoctorAppointments from "../pages/Doctor/DoctorAppointments";
import DoctorOverview from "../pages/Doctor/DoctorOverview";
import PatientDashboardLayout from "../layouts/PatientDashboardLayout";
import PatientOverview from "../pages/Patient/PatientOverview";
import PatientAppointments from "../pages/Patient/PatientAppointments";
import PatientBookAppointment from "../pages/Patient/PatientBookAppointment";
import DoctorManagement from "../pages/Doctor/DoctorManagement";
import AdminAddDoctorForm from "../components/Admin/AdminAddDoctorForm";
import AdminEditDoctorForm from "../components/Admin/AdminEditDoctorForm";
import AdminDoctorDetails from "../components/Admin/AdminDoctorDetails";
import AdminPatientDetails from "../components/Admin/AdminPatientDetails";
import AdminAppointmentsDetails from "../components/Admin/AdminAppointmentsDetails";
import DoctorAppointmentDetails from "../components/Doctor/DoctorAppointmentDetails";
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
            element: <AdminDashboardLayout />,
            children: [
              {
                path: "/admin",
                element: <AdminOverview />,
              },
              {
                path: "/admin/doctors",
                element: <AdminDoctorList />,
              },
              {
                path: "/admin/addNewDoctor",
                element: <AdminAddDoctorForm />,
              },
              {
                path: "/admin/editDoctor/:id",
                element: <AdminEditDoctorForm />,
              },
              {
                path: "/admin/doctors/:id",
                element: <AdminDoctorDetails />,
              },
              {
                path: "/admin/patients",
                element: <AdminPatientList />,
              },
              {
                path: "/admin/patients/:id",
                element: <AdminPatientDetails />,
              },
              {
                path: "/admin/appointments",
                element: <AdminAppointments />,
              },
              {
                path: "/admin/appointments/:id",
                element: <AdminAppointmentsDetails />,
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
            element: <DoctorDashboardLayout />,
            children: [
              {
                path: "/doctor",
                element: <DoctorOverview />,
              },
              {
                path: "/doctor/management",
                element: <DoctorManagement />,
              },
              {
                path: "/doctor/appointments",
                element: <DoctorAppointments />,
              },
              {
                path: "/doctor/appointments/:id",
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
            element: <PatientDashboardLayout />,
            children: [
              {
                path: "/patient",
                element: <PatientOverview />,
              },
              {
                path: "/patient/bookAppointment",
                element: <PatientBookAppointment />,
              },
              {
                path: "/patient/appointments",
                element: <PatientAppointments />,
              },
              {
                path: "/patient/appointments/:id",
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
