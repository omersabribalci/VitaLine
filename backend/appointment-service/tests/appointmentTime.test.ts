const assert = require("node:assert/strict");
const test = require("node:test");
const {
  clinicDateTimeToUtc,
  getClinicDateKey,
  getClinicTime,
} = require("../src/utils/appointmentTime.js");

test("İstanbul clinic time is stored as UTC", () => {
  const storedDate = clinicDateTimeToUtc("2030-01-07", "09:00");

  assert.equal(storedDate.toISOString(), "2030-01-07T06:00:00.000Z");
});

test("UTC appointment time is read using the İstanbul clinic calendar", () => {
  const storedDate = new Date("2030-01-07T06:00:00.000Z");

  assert.equal(getClinicDateKey(storedDate), "2030-01-07");
  assert.equal(getClinicTime(storedDate), "09:00");
});
