import type { SelectChangeEvent, ToggleButtonGroupProps } from "@mui/material";
import type { FC, ReactNode } from "react";
import type {
  Control,
  FieldErrors,
  RegisterOptions,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

export type User = {
  token: string | null;
  isAuthenticated: boolean;
  role: string | null;
  id: string | null;
  name: string | null;
  image: string | null;
};

export type CredentialsPayload = {
  token: string | null;
  user: {
    role: string | null;
    id: string | null;
    name: string | null;
    image: string | null;
  };
};

export type LoginFormData = {
  email: string;
  password: string;
};

export type ApiError = {
  data: {
    message: string;
  };
};

export type ProtectedRouteProps = {
  allowedRoles: string[];
};

export type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type dateRange = {
  start: string;
  end: string;
};

export interface Doctor {
  id: string;
  title: string;
  name: string;
  speciality: string;
  email: string;
  phone: string;
  image: string;
  unavailableDates: dateRange[];
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountStatus: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  speciality: string;
  dateAndTime: string;
  status: string;
}

export type TableProps<
  T extends { id: string | number } = { id: string | number },
> = {
  list?: T[];
  heads: Array<{ key: string; label: string }>;
  entityType: string;
  detailPath?: string;
};

export type TableHeads = {
  label: string;
  key: string;
};

export type StatCardProps<T> = {
  icon: React.ReactNode;
  parameter: T[] | undefined;
  title: string;
};

export type AddDoctorFormData = {
  title: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  password: string;
  speciality: string;
};

export type EditDoctorFormData = {
  title: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  speciality: string;
  password?: string;
};

export type ErrorProps = {
  refetch?: () => unknown;
  isFetching?: boolean;
};

export type DoctorSetHolidayFormData = {
  startDate: Date | null;
  endDate: Date | null;
};

interface NavigationItem {
  icon: FC;
}

export interface NavigationLinkProps {
  title: string;
  link: string;
  item: NavigationItem;
}

export type BasicSelectProps = {
  label: string;
  value: string | null;
  onChange: (event: SelectChangeEvent<string>) => void;
  menuItems: string[];
  className?: string;
};

export type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode; // string veya JSX olabilir
  message: ReactNode; // string veya JSX olabilir
  confirmText?: string;
  cancelText?: string;
  confirmColor?:
  | "inherit"
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "info"
  | "warning";
  isLoading?: boolean;
};

export type CustomDatePickerProps = {
  label: React.ReactNode;
  value: Date | null;
  onChange: (date: Date | null) => void;
  disablePast?: boolean;
  maxDate?: Date; // null değil, opsiyonel Date
  shouldDisableDate?: (day: Date) => boolean; // null değil, opsiyonel fonksiyon
};

export type ResponsiveGridProps = {
  array: string[]; // zaman slotları
  value: string | null; // seçili değer
  onChange: ToggleButtonGroupProps["onChange"];
  isTimeBooked: (time: string) => boolean; // slot dolu mu kontrolü
  className?: string;
};

export type BookAppointmentFormData = {
  date: Date | null;
  doctorName: string | null;
  speciality: string | null;
  time: string | null;
};

export type SpecialityDoctorSelectorProps = {
  control: Control<BookAppointmentFormData>;
  specialities: string[];
  speciality: string | null;
  doctorsBySpeciality: Doctor[] | undefined;
  onSpecialityChange: () => void;
  onDoctorChange: () => void;
  doctorNamesArray: string[];
  isLoading: boolean;
};

export type DateTimeSelectorProps = {
  control: Control<BookAppointmentFormData>;
  date: Date | null;
  time: string | null;
  setValue: UseFormSetValue<BookAppointmentFormData>;
  appointmentTimes: string[];
  isTimeBooked: (time: string) => boolean;
  disableDateFunction: (day: Date) => boolean;
  isAdding: boolean;
  selectedDoctor: Doctor;
};

export type CheckboxProps = {
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  label?: string;
  property: string;
};

export interface FormInputProps {
  type: string;
  placeholder: string;
  name: string;
  rules?: RegisterOptions<any>;
  register: UseFormRegister<any>;
  errors?: FieldErrors<any>;
}
