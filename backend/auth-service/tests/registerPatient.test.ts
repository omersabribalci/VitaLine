const assert = require("node:assert/strict");
const test = require("node:test");
const { Types } = require("mongoose");
const PatientClient = require("../src/clients/patientClient.js");
const User = require("../src/models/User.js");
const registrationService = require("../src/services/registerPatient.js");

const input = {
  name: "tEST pATIENT mIDDLE",
  email: "PATIENT@EXAMPLE.COM",
  phone: "05555555555",
  password: "Strong123",
  image: "",
};

test("registration creates the Auth user and Patient profile", async (t: any) => {
  const userId = new Types.ObjectId();

  t.mock.method(User, "findOne", () => ({ lean: async () => null }));
  t.mock.method(User, "create", async (data: any) => ({ _id: userId, ...data }));
  t.mock.method(PatientClient, "createPatient", async (receivedId: string) => ({
    id: new Types.ObjectId().toString(),
    userId: receivedId,
    accountStatus: "enabled",
  }));

  const result = await registrationService.registerPatient(input, "request-1");

  assert.equal(result.user.name, "Test Patient Middle");
  assert.equal(result.user.email, "patient@example.com");
  assert.equal(result.patient.userId, userId.toString());
});

test("registration removes the new user if Patient Service fails", async (t: any) => {
  const userId = new Types.ObjectId();
  let deletedUserId = "";

  t.mock.method(User, "findOne", () => ({ lean: async () => null }));
  t.mock.method(User, "create", async (data: any) => ({ _id: userId, ...data }));
  t.mock.method(User, "findByIdAndDelete", async (id: any) => {
    deletedUserId = id.toString();
  });
  t.mock.method(PatientClient, "createPatient", async () => {
    throw new PatientClient.PatientServiceError(
      "Patient Service is unavailable.",
      503,
    );
  });

  await assert.rejects(
    registrationService.registerPatient(input, "request-2"),
    /Patient Service is unavailable/,
  );
  assert.equal(deletedUserId, userId.toString());
});
