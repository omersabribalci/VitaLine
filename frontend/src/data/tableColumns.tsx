import AppointmentStatusBadge from "../components/UI/AppointmentStatusBadge";
import type { Appointment, Doctor, Patient, TableColumn } from "../types";
import { formatAppointmentDateTime } from "../utils/appointmentUtils";

export const doctorColumns: TableColumn<Doctor>[] = [
  { label: "Title", render: (doctor) => doctor.title },
  { label: "Name", render: (doctor) => doctor.userId.name },
  { label: "Speciality", render: (doctor) => doctor.speciality },
  { label: "Phone", render: (doctor) => doctor.userId.phone },
  { label: "Email", render: (doctor) => doctor.userId.email },
];

export const patientColumns: TableColumn<Patient>[] = [
  { label: "Name", render: (patient) => patient.userId.name },
  {
    label: "Email",
    render: (patient) => (
      <span className="font-medium text-sky-600">{patient.userId.email}</span>
    ),
  },
  { label: "Phone", render: (patient) => patient.userId.phone },
];

export const appointmentColumns: TableColumn<Appointment>[] = [
  {
    label: "Patient",
    render: (appointment) =>
      appointment.patientId?.userId?.name ?? "Unknown patient",
  },
  {
    label: "Doctor",
    render: (appointment) =>
      appointment.doctorId?.userId?.name ?? "Unknown doctor",
  },
  {
    label: "Speciality",
    render: (appointment) =>
      appointment.doctorId?.speciality ?? "Unknown speciality",
  },
  {
    label: "Date",
    render: (appointment) =>
      formatAppointmentDateTime(appointment.dateAndTime),
  },
  {
    label: "Status",
    render: (appointment) => (
      <AppointmentStatusBadge status={appointment.status} />
    ),
  },
];

export const doctorAppointmentColumns: TableColumn<Appointment>[] = [
  {
    label: "Patient",
    render: (appointment) =>
      appointment.patientId?.userId?.name ?? "Unknown patient",
  },
  {
    label: "Date",
    render: (appointment) =>
      formatAppointmentDateTime(appointment.dateAndTime),
  },
  {
    label: "Status",
    render: (appointment) => (
      <AppointmentStatusBadge status={appointment.status} />
    ),
  },
];
