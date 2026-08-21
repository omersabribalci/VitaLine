import type { Appointment, Doctor, Patient, TableColumn } from "../types";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return `${date.toLocaleDateString("tr-TR")} ${date.toLocaleTimeString(
    "tr-TR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
};

export const doctorColumns: TableColumn<Doctor>[] = [
  { label: "Title", render: (doctor) => doctor.title },
  { label: "Name", render: (doctor) => doctor.userId.name },
  { label: "Speciality", render: (doctor) => doctor.speciality },
  { label: "Phone", render: (doctor) => doctor.userId.phone },
  { label: "Email", render: (doctor) => doctor.userId.email },
];

export const patientColumns: TableColumn<Patient>[] = [
  { label: "Name", render: (patient) => patient.userId.name },
  { label: "Email", render: (patient) => patient.userId.email },
  { label: "Phone", render: (patient) => patient.userId.phone },
];

export const appointmentColumns: TableColumn<Appointment>[] = [
  {
    label: "Patient",
    render: (appointment) => appointment.patientId.userId.name,
  },
  {
    label: "Doctor",
    render: (appointment) => appointment.doctorId.userId.name,
  },
  {
    label: "Speciality",
    render: (appointment) => appointment.doctorId.speciality,
  },
  {
    label: "Date",
    render: (appointment) => formatDateTime(appointment.dateAndTime),
  },
  { label: "Status", render: (appointment) => appointment.status },
];

export const doctorAppointmentColumns: TableColumn<Appointment>[] = [
  {
    label: "Patient",
    render: (appointment) => appointment.patientId.userId.name,
  },
  {
    label: "Date",
    render: (appointment) => formatDateTime(appointment.dateAndTime),
  },
  { label: "Status", render: (appointment) => appointment.status },
];
