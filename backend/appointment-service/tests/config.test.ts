// @ts-nocheck
const assert: typeof import("node:assert/strict") = require("node:assert/strict");
const test: typeof import("node:test") = require("node:test");
const { loadConfig }: typeof import("../src/config/env.js") = require("../src/config/env.js");

const validEnv = {
  PORT: "5004",
  MONGODB_URI: "mongodb://localhost/vitaline_appointments",
  AUTH_SERVICE_URL: "http://auth-service:5001",
  DOCTOR_SERVICE_URL: "http://doctor-service:5003/",
  PATIENT_SERVICE_URL: "http://patient-service:5002",
  INTERNAL_API_KEY: "internal-key",
  ACCESS_TOKEN_SECRET: "access-secret",
};

test("loads and normalizes Appointment Service configuration", () => {
  const config = loadConfig(validEnv);
  assert.equal(config.port, 5004);
  assert.equal(config.doctorServiceUrl, "http://doctor-service:5003");
});

test("rejects an invalid downstream service URL", () => {
  assert.throws(
    () => loadConfig({ ...validEnv, DOCTOR_SERVICE_URL: "not-a-url" }),
    /DOCTOR_SERVICE_URL must be a valid URL/,
  );
});
