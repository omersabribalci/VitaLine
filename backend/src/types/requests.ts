import type {
  AccountStatus,
  AppointmentStatus,
  BookingPolicyValue,
} from "./index";

export interface IdParams extends Record<string, string> {
  id: string;
}

export interface RegisterPatientBody {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  image?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AppointmentListQuery extends Record<string, string | undefined> {
  doctorId?: string;
  patientId?: string;
}

export interface AvailabilityQuery extends Record<string, string> {
  doctorId: string;
  date: string;
}

export interface CreateAppointmentBody {
  doctorId: string;
  patientId?: string;
  dateAndTime: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentBody {
  doctorId?: string;
  patientId?: string;
  dateAndTime?: string;
  status?: AppointmentStatus;
}

export interface DoctorListQuery extends Record<string, string | undefined> {
  search?: string;
  speciality?: string;
  sort?: "name";
}

export interface UnavailableDateRangeInput {
  start: string;
  end: string;
}

export interface CreateDoctorBody {
  title: string;
  name: string;
  email: string;
  phone: string;
  image?: string;
  password: string;
  speciality: string;
}

export interface UpdateDoctorBody {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  image?: string;
  password?: string;
  speciality?: string;
  unavailableDates?: UnavailableDateRangeInput[];
}

export interface UpdatePatientBody {
  accountStatus: AccountStatus;
}

export type UpdateBookingPolicyBody = Partial<BookingPolicyValue>;
