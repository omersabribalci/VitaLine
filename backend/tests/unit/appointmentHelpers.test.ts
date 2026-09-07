import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkDateRules,
  generateSlotsForDay,
  isDuringLunchBreak,
  isWithinWorkingHours,
} from "../../src/utils/appointmentHelpers";
import type { BookingPolicyValue } from "../../src/types";

const policy: BookingPolicyValue = {
  appointmentDurationMinutes: 30,
  bookingWindowDays: 14,
  workingTimeStart: "09:00",
  workingTimeEnd: "11:00",
  workingDays: [1, 2, 3, 4, 5],
  lunchBreakStart: "10:00",
  lunchBreakEnd: "10:30",
};

describe("appointmentHelpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 10, 15));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkDateRules", () => {
    it("rejects a past date", () => {
      expect(
        checkDateRules(new Date(2026, 8, 6), policy, {
          unavailableDates: [],
        }),
      ).toBe("Appointment date must be in the future.");
    });

    it("rejects a non-working day supplied by the booking policy", () => {
      expect(
        checkDateRules(new Date(2026, 8, 12), policy, {
          unavailableDates: [],
        }),
      ).toBe("Appointments cannot be booked on non-working days.");
    });

    it("rejects a date outside the booking window", () => {
      expect(
        checkDateRules(new Date(2026, 8, 22), policy, {
          unavailableDates: [],
        }),
      ).toContain("14 days in advance");
    });

    it("rejects both boundaries of a doctor's holiday", () => {
      const doctor = {
        unavailableDates: [
          {
            start: new Date(2026, 8, 14),
            end: new Date(2026, 8, 15),
          },
        ],
      };

      expect(checkDateRules(new Date(2026, 8, 14), policy, doctor)).toBe(
        "The selected doctor is not available on this date.",
      );
      expect(checkDateRules(new Date(2026, 8, 15), policy, doctor)).toBe(
        "The selected doctor is not available on this date.",
      );
    });

    it("accepts a working day inside the booking window", () => {
      expect(
        checkDateRules(new Date(2026, 8, 8), policy, {
          unavailableDates: [],
        }),
      ).toBeNull();
    });
  });

  describe("working-hour and lunch rules", () => {
    it("accepts only slots fully contained in working hours", () => {
      expect(isWithinWorkingHours("09:00", "09:30", policy)).toBe(true);
      expect(isWithinWorkingHours("08:30", "09:00", policy)).toBe(false);
      expect(isWithinWorkingHours("10:45", "11:15", policy)).toBe(false);
    });

    it("detects overlap with the lunch break", () => {
      expect(isDuringLunchBreak("09:45", "10:15", policy)).toBe(true);
      expect(isDuringLunchBreak("10:30", "11:00", policy)).toBe(false);
    });
  });

  describe("generateSlotsForDay", () => {
    it("skips lunch and marks an existing appointment as unavailable", () => {
      const slots = generateSlotsForDay(
        policy,
        new Date(2026, 8, 8),
        "2026-09-08",
        [{ dateAndTime: new Date(2026, 8, 8, 9, 30) }],
      );

      expect(slots).toEqual([
        { time: "09:00", isAvailable: true },
        { time: "09:30", isAvailable: false },
        { time: "10:30", isAvailable: true },
      ]);
    });

    it("marks today's past slots as unavailable", () => {
      const slots = generateSlotsForDay(
        { ...policy, lunchBreakStart: undefined, lunchBreakEnd: undefined },
        new Date(2026, 8, 7),
        "2026-09-07",
        [],
      );

      expect(slots).toEqual([
        { time: "09:00", isAvailable: false },
        { time: "09:30", isAvailable: false },
        { time: "10:00", isAvailable: false },
        { time: "10:30", isAvailable: true },
      ]);
    });
  });
});
