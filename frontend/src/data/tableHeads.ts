import type { TableHeads } from "../types";

export const doctorsListHeads: TableHeads[] = [
  { label: "Title", key: "title" },
  { label: "Name", key: "name" },
  { label: "Speciality", key: "speciality" },
  { label: "Phone", key: "phone" },
  { label: "Email", key: "email" },
];

export const patientsListHeads: TableHeads[] = [
  { label: "Name", key: "name" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
];

export const appointmentsListHead: TableHeads[] = [
  { label: "Patient", key: "patientName" },
  { label: "Doctor", key: "doctorName" },
  { label: "Speciality", key: "speciality" },
  { label: "Date", key: "dateAndTime" },
  { label: "Status", key: "status" },
];

export const appointmentsListHeadforDoctors: TableHeads[] = [
  { label: "Patient", key: "patientName" },
  { label: "Date", key: "dateAndTime" },
  { label: "Status", key: "status" },
];
