const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const test: typeof import("node:test") = require("node:test");
const { Types } = require("mongoose");
const authClient = require("../src/clients/authClient.js");
const appointmentClient = require("../src/clients/appointmentLifecycleClient.js");
const Doctor = require("../src/models/Doctor.js");
const doctorService = require("../src/services/doctorService.js");

test("available specialities use the shared catalog order", async (t) => {
  t.mock.method(Doctor, "distinct", async () => ["Oncology", "Cardiology", "Legacy"]);

  assert.deepEqual(await doctorService.getAvailableSpecialities(), [
    "Cardiology",
    "Oncology",
  ]);
});

test("doctor creation combines Auth user and Doctor profile", async (t) => {
  const userId = new Types.ObjectId().toString();
  const doctorId = new Types.ObjectId();

  t.mock.method(authClient, "createDoctorUser", async () => ({ _id: userId }));
  t.mock.method(Doctor, "create", async (input: any) => ({
    _id: doctorId,
    unavailableDates: [],
    ...input,
  }));

  const result = await doctorService.createDoctor({
    name: "Test Doctor",
    email: "doctor@example.com",
    phone: "05555555555",
    password: "Strong123",
    title: "Dr.",
    speciality: "Cardiology",
  });

  assert.equal(result.doctor.userId, userId);
});

test("doctor update sends shared user fields to Auth Service", async (t) => {
  const userId = new Types.ObjectId();
  let receivedChanges: Record<string, unknown> = {};

  t.mock.method(Doctor, "findById", () => ({
    select: () => ({ lean: async () => ({ userId }) }),
  }));
  t.mock.method(authClient, "updateUserProfile", async (_id: string, changes: any) => {
    receivedChanges = changes;
  });

  await doctorService.updateDoctor(
    new Types.ObjectId().toString(),
    { id: "admin-id", role: "admin" },
    { name: "Updated Doctor" },
  );

  assert.deepEqual(receivedChanges, { name: "Updated Doctor" });
});

test("doctor update sends a new password to Auth Service separately", async (t) => {
  const userId = new Types.ObjectId();
  let receivedPassword = "";

  t.mock.method(Doctor, "findById", () => ({
    select: () => ({ lean: async () => ({ userId }) }),
  }));
  t.mock.method(authClient, "updateUserProfile", async () => {
    throw new Error("profile update should not be called");
  });
  t.mock.method(authClient, "updateUserPassword", async (_id: string, password: string) => {
    receivedPassword = password;
  });

  await doctorService.updateDoctor(
    new Types.ObjectId().toString(),
    { id: "admin-id", role: "admin" },
    { password: "NewStrong123" },
  );

  assert.equal(receivedPassword, "NewStrong123");
});

test("doctor deletion cancels appointments before deactivating the user", async (t) => {
  const calls: string[] = [];
  const userId = new Types.ObjectId();

  t.mock.method(Doctor, "findById", () => ({
    select: () => ({ lean: async () => ({ userId }) }),
  }));
  t.mock.method(appointmentClient, "cancelForDoctor", async () => calls.push("appointments"));
  t.mock.method(authClient, "deactivateUser", async () => calls.push("auth"));
  t.mock.method(Doctor, "findByIdAndUpdate", async () => calls.push("doctor"));

  await doctorService.deleteDoctor(new Types.ObjectId().toString());

  assert.deepEqual(calls, ["appointments", "auth", "doctor"]);
});
