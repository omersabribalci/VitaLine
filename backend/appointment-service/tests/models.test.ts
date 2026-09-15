// @ts-nocheck
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const test: typeof import("node:test") = require("node:test");
const Appointment: typeof import("../src/models/Appointment.js") = require("../src/models/Appointment.js");
const BookingPolicy: typeof import("../src/models/BookingPolicy.js") = require("../src/models/BookingPolicy.js");

test("Appointment stores foreign IDs without Mongoose refs", () => {
  const doctorPath = Appointment.schema.path("doctorId") as import("mongoose").SchemaType & {
    options: { ref?: string };
  };
  const patientPath = Appointment.schema.path("patientId") as import("mongoose").SchemaType & {
    options: { ref?: string };
  };

  assert.equal(doctorPath.options.ref, undefined);
  assert.equal(patientPath.options.ref, undefined);
});

test("Appointment has database guards for simultaneous slot bookings", () => {
  const indexes = Appointment.schema.indexes();
  const indexNames = indexes.map(([, options]) => options.name);

  assert.ok(indexNames.includes("one_active_appointment_per_doctor_slot"));
  assert.ok(indexNames.includes("one_active_appointment_per_patient_slot"));
  assert.ok(
    indexNames.includes("one_active_appointment_per_patient_doctor_day"),
  );
});

test("BookingPolicy applies the default singleton configuration", async () => {
  const policy = new BookingPolicy();
  await policy.validate();

  assert.equal(policy.singletonKey, "default");
  assert.equal(policy.appointmentDurationMinutes, 30);
  assert.deepEqual(policy.workingDays, [1, 2, 3, 4, 5]);
});

test("BookingPolicy rejects a lunch break outside working hours", async () => {
  const policy = new BookingPolicy({
    workingTimeStart: "09:00",
    workingTimeEnd: "16:00",
    lunchBreakStart: "08:00",
    lunchBreakEnd: "09:30",
  });

  await assert.rejects(policy.validate(), /inside working hours/);
});
