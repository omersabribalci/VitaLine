const assert = require("node:assert/strict");
const test = require("node:test");
const { Types } = require("mongoose");
const Appointment = require("../src/models/Appointment.js");
const BookingPolicy = require("../src/models/BookingPolicy.js");
const doctorClient = require("../src/clients/doctorClient.js");
const patientClient = require("../src/clients/patientClient.js");
const creationService = require("../src/services/createAppointment.js");
const cancellationService = require("../src/services/cancelOwnerAppointments.js");

test("patient appointment uses the authenticated user's profile", async (t: any) => {
  const doctorId = new Types.ObjectId().toString();
  const patientId = new Types.ObjectId().toString();
  let receivedUserId = "";

  t.mock.method(doctorClient, "getById", async () => ({
    id: doctorId,
    unavailableDates: [],
  }));
  t.mock.method(patientClient, "getByUserId", async (userId: string) => {
    receivedUserId = userId;
    return { id: patientId, accountStatus: "enabled" };
  });
  t.mock.method(BookingPolicy, "getPolicy", async () => ({
    appointmentDurationMinutes: 30,
    bookingWindowDays: 3650,
    workingTimeStart: "09:00",
    workingTimeEnd: "17:00",
    workingDays: [1, 2, 3, 4, 5],
    lunchBreakStart: null,
    lunchBreakEnd: null,
  }));
  t.mock.method(Appointment, "exists", async () => null);
  t.mock.method(Appointment, "create", async (input: any) => ({
    _id: new Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...input,
  }));

  const userId = new Types.ObjectId().toString();
  const appointment = await creationService.createAppointment(
    { id: userId, role: "patient" },
    {
      doctorId,
      dateAndTime: "2030-01-07T06:00:00.000Z",
      requestId: "request-1",
    },
  );

  assert.equal(receivedUserId, userId);
  assert.equal(appointment.patientId, patientId);
});

test("owner cancellation updates scheduled appointments in one query", async (t: any) => {
  let filter: Record<string, unknown> = {};
  t.mock.method(Appointment, "updateMany", async (receivedFilter: any) => {
    filter = receivedFilter;
    return { modifiedCount: 2 };
  });

  const patientId = new Types.ObjectId().toString();
  const result = await cancellationService.cancelOwnerAppointments(
    "patient",
    patientId,
  );

  assert.equal(filter.patientId, patientId);
  assert.equal(result.cancelledCount, 2);
});
