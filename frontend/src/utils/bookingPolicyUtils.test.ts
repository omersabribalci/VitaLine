import { describe, expect, it } from "vitest";
import { isAppointmentDateDisabled } from "./bookingPolicyUtils";
import type { AvailabilityPolicy, Doctor } from "../types";

const policy: AvailabilityPolicy = {
  appointmentDurationMinutes: 30,
  bookingWindowDays: 30,
  workingTimeStart: "09:00",
  workingTimeEnd: "17:00",
  workingDays: [1, 2, 3, 4, 5],
  lunchBreakStart: "12:00",
  lunchBreakEnd: "13:00",
};

const noHolidays: Doctor["unavailableDates"] = [];

describe("isAppointmentDateDisabled", () => {
  it("disables a day that the backend policy does not mark as working", () => {
    expect(
      isAppointmentDateDisabled(new Date(2026, 8, 12), policy, noHolidays),
    ).toBe(true);
  });

  it("does not hard-code weekends when the backend marks Saturday as working", () => {
    const saturdayPolicy = { ...policy, workingDays: [...policy.workingDays, 6] };

    expect(
      isAppointmentDateDisabled(
        new Date(2026, 8, 12),
        saturdayPolicy,
        noHolidays,
      ),
    ).toBe(false);
  });

  it("disables both the start and end date of a doctor's holiday", () => {
    const holidays = [{ start: "2026-09-14", end: "2026-09-16" }];

    expect(
      isAppointmentDateDisabled(new Date(2026, 8, 14), policy, holidays),
    ).toBe(true);
    expect(
      isAppointmentDateDisabled(new Date(2026, 8, 16), policy, holidays),
    ).toBe(true);
  });

  it("keeps a normal working day enabled", () => {
    expect(
      isAppointmentDateDisabled(new Date(2026, 8, 8), policy, noHolidays),
    ).toBe(false);
  });

  it("ignores an invalid holiday range instead of crashing the calendar", () => {
    const invalidHoliday = [{ start: "invalid", end: "2026-09-16" }];

    expect(
      isAppointmentDateDisabled(
        new Date(2026, 8, 15),
        policy,
        invalidHoliday,
      ),
    ).toBe(false);
  });
});
