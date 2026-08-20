import type { SelectChangeEvent, ToggleButtonGroupProps } from "@mui/material";
import type { FC, ReactNode } from "react";
import type {
  Control,
  FieldErrors,
  RegisterOptions,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

export type Role = "admin" | "doctor" | "patient";

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
};

export type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  user: User | null;
  authStatus: "idle" | "authenticated" | "unauthenticated";
};

export type CredentialsPayload = {
  accessToken: string;
  user: User;
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

export type LoginData = {
  token: string;
  user: User;
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

export type DoctorTitle =
  | "Dr."
  | "Ast. Dr."
  | "Uzm. Dr."
  | "Op. Dr."
  | "Doç. Dr."
  | "Prof. Dr.";

export interface Doctor {
  _id: string;
  userId: User;
  title: DoctorTitle;
  speciality: string;
  image: string;
  unavailableDates: dateRange[];
}

export type AccountStatus = "enabled" | "disabled";
export interface Patient {
  _id: string;
  userId: User;
  accountStatus: AccountStatus;
}
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";
export interface Appointment {
  _id: string;
  doctorId: Doctor;
  patientId: Patient;
  dateAndTime: string;
  status: AppointmentStatus;
}

export type TableProps<
  T extends { _id: string | number } = { _id: string | number },
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

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
