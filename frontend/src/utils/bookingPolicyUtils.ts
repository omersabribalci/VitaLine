import type { BookingPolicyForm } from "../types";

export const weekDays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const defaultBookingPolicyForm: BookingPolicyForm = {
  slotDurationMinutes: 15,
  bookingWindowDays: 30,
  defaultStartHour: "09:00",
  defaultEndHour: "17:00",
  defaultWorkDays: [1, 2, 3, 4, 5],
  lunchBreakStart: "12:00",
  lunchBreakEnd: "13:00",
};

export const normalizeBookingPolicyForm = (
  policy?: Partial<BookingPolicyForm> | null,
): BookingPolicyForm => ({
  slotDurationMinutes:
    policy?.slotDurationMinutes ?? defaultBookingPolicyForm.slotDurationMinutes,
  bookingWindowDays:
    policy?.bookingWindowDays ?? defaultBookingPolicyForm.bookingWindowDays,
  defaultStartHour:
    policy?.defaultStartHour ?? defaultBookingPolicyForm.defaultStartHour,
  defaultEndHour:
    policy?.defaultEndHour ?? defaultBookingPolicyForm.defaultEndHour,
  defaultWorkDays:
    policy?.defaultWorkDays ?? defaultBookingPolicyForm.defaultWorkDays,
  lunchBreakStart:
    policy?.lunchBreakStart ?? defaultBookingPolicyForm.lunchBreakStart,
  lunchBreakEnd:
    policy?.lunchBreakEnd ?? defaultBookingPolicyForm.lunchBreakEnd,
});
