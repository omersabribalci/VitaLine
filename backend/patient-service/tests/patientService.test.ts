const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const test: typeof import("node:test") = require("node:test");
const { Types } = require("mongoose");
const authClient = require("../src/clients/authClient.js");
const appointmentClient = require("../src/clients/appointmentLifecycleClient.js");
const Patient = require("../src/models/Patient.js");
const patientService = require("../src/services/patientService.js");

test("patient profile is created for an Auth user", async (t) => {
  const userId = new Types.ObjectId().toString();
  const patientId = new Types.ObjectId();

  t.mock.method(Patient, "findOne", () => ({ lean: async () => null }));
  t.mock.method(Patient, "create", async (input: any) => ({
    _id: patientId,
    ...input,
  }));

  const patient = await patientService.registerPatientProfile(userId);

  assert.equal(patient.id, patientId.toString());
  assert.equal(patient.userId, userId);
  assert.equal(patient.accountStatus, "enabled");
});

test("patient list joins profile data with Auth user data", async (t) => {
  const userId = new Types.ObjectId().toString();
  t.mock.method(Patient, "find", () => ({
    sort: () => ({
      lean: async () => [{
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        accountStatus: "enabled",
      }],
    }),
  }));
  t.mock.method(authClient, "resolveUsers", async () => [{
    _id: userId,
    name: "Test Patient",
    role: "patient",
  }]);

  const result = await patientService.getPatients({ page: 1, limit: 10 });

  assert.equal(result.items[0].userId.name, "Test Patient");
});

test("patient deletion cancels appointments before deactivating the user", async (t) => {
  const calls: string[] = [];
  const userId = new Types.ObjectId();

  t.mock.method(Patient, "findById", () => ({
    lean: async () => ({ userId, isDeleted: false }),
  }));
  t.mock.method(appointmentClient, "cancelForPatient", async () => calls.push("appointments"));
  t.mock.method(authClient, "deactivateUser", async () => calls.push("auth"));
  t.mock.method(Patient, "findByIdAndUpdate", async () => calls.push("patient"));

  await patientService.deletePatient(new Types.ObjectId().toString());

  assert.deepEqual(calls, ["appointments", "auth", "patient"]);
});
