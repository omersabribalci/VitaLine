import {
  endOfDay,
  getDay,
  isValid,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import type { AvailabilityPolicy, Doctor } from "../types";

export const weekDays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export const isAppointmentDateDisabled = (
  day: Date,
  policy: AvailabilityPolicy,
  unavailableDates: Doctor["unavailableDates"],
): boolean => {
  if (!policy.workingDays.includes(getDay(day))) {
    return true;
  }

  return unavailableDates.some(({ start, end }) => {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    if (!isValid(startDate) || !isValid(endDate)) {
      return false;
    }

    return isWithinInterval(day, {
      start: startOfDay(startDate),
      end: endOfDay(endDate),
    });
  });
};
