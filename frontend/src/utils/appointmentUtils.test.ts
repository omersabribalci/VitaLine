import { describe, expect, it } from "vitest";
import {
  createAppointmentDateTime,
  formatAppointmentDateTime,
  getClinicToday,
} from "./appointmentUtils";

describe("appointment timezone helpers", () => {
  it("converts a selected İstanbul clinic time to UTC", () => {
    const selectedDate = new Date(2030, 0, 7);

    expect(createAppointmentDateTime(selectedDate, "09:00")).toBe(
      "2030-01-07T06:00:00.000Z",
    );
  });

  it("always displays stored UTC time in the İstanbul clinic timezone", () => {
    expect(formatAppointmentDateTime("2030-01-07T06:00:00.000Z")).toBe(
      "07.01.2030 09:00",
    );
  });

  it("uses İstanbul's calendar day even when the browser is in another timezone", () => {
    const clinicToday = getClinicToday(new Date("2030-01-06T22:00:00.000Z"));

    expect(clinicToday.getFullYear()).toBe(2030);
    expect(clinicToday.getMonth()).toBe(0);
    expect(clinicToday.getDate()).toBe(7);
  });
});
