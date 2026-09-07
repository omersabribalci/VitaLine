export const USER_ROLES = ["admin", "doctor", "patient"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const APPOINTMENT_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const ACCOUNT_STATUSES = ["enabled", "disabled"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface DateRangeValue {
  start: Date;
  end: Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

// Express Request's generics carry body, query-string and route-parameter types.
export type AppRequest<
  Body = unknown,
  Query extends import("express-serve-static-core").Query = import("express-serve-static-core").Query,
  Params extends import("express-serve-static-core").ParamsDictionary = import("express-serve-static-core").ParamsDictionary,
> = import("express").Request<Params, unknown, Body, Query>;

export interface BookingPolicyValue {
  appointmentDurationMinutes: number;
  bookingWindowDays: number;
  workingTimeStart: string;
  workingTimeEnd: string;
  workingDays: number[];
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
}

export interface DoctorValue {
  _id: unknown;
  title: string;
  speciality: string;
  unavailableDates: DateRangeValue[];
  userId: unknown;
}

export interface AppointmentValue {
  _id?: unknown;
  doctorId: unknown;
  patientId: unknown;
  dateAndTime: Date;
  status: AppointmentStatus;
}

export interface AvailabilitySlot {
  time: string;
  isAvailable: boolean;
}

export interface UserDocumentShape {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  image: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorDocumentShape {
  userId: import("mongoose").Types.ObjectId;
  title: string;
  speciality: string;
  unavailableDates: DateRangeValue[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDocumentShape {
  userId: import("mongoose").Types.ObjectId;
  accountStatus: AccountStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentDocumentShape {
  doctorId: import("mongoose").Types.ObjectId;
  patientId: import("mongoose").Types.ObjectId;
  dateAndTime: Date;
  status: AppointmentStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingPolicyDocumentShape extends BookingPolicyValue {
  createdAt: Date;
  updatedAt: Date;
}

export interface RefreshTokenDocumentShape {
  user: import("mongoose").Types.ObjectId;
  tokenHash: string;
  jti: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedBy: string | null;
  createdAt: Date;
  ip?: string;
  userAgent?: string;
}
