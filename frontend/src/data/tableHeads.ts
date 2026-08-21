import type { TableHeads } from "../types";

export const doctorsListHeads: TableHeads[] = [
  { label: "Title", key: "title" },
  { label: "Name", key: "userId.name" },
  { label: "Speciality", key: "speciality" },
  { label: "Phone", key: "userId.phone" },
  { label: "Email", key: "userId.email" },
];

export const patientsListHeads: TableHeads[] = [
  { label: "Name", key: "userId.name" },
  { label: "Email", key: "userId.email" },
  { label: "Phone", key: "userId.phone" },
];

export const appointmentsListHead: TableHeads[] = [
  { label: "Patient", key: "patientId.userId.name" },
  { label: "Doctor", key: "doctorId.userId.name" },
  { label: "Speciality", key: "doctorId.speciality" },
  { label: "Date", key: "dateAndTime" },
  { label: "Status", key: "status" },
];

export const appointmentsListHeadforDoctors: TableHeads[] = [
  { label: "Patient", key: "patientId.userId.name" },
  { label: "Date", key: "dateAndTime" },
  { label: "Status", key: "status" },
];
