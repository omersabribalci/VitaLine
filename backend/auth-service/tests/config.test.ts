const assert = require("node:assert/strict");
const test = require("node:test");
const { loadConfig } = require("../src/config/env.js");

const validProductionEnv = {
  NODE_ENV: "production",
  PORT: "5001",
  MONGODB_URI: "mongodb://mongodb:27017/vitaline_auth",
  ACCESS_TOKEN_SECRET: "a".repeat(64),
  REFRESH_TOKEN_SECRET: "b".repeat(64),
  INTERNAL_API_KEY: "c".repeat(64),
  PATIENT_SERVICE_URL: "http://patient-service:5002",
  DOCTOR_SERVICE_URL: "http://doctor-service:5003",
  ADMIN_NAME: "VitaLine Admin",
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "strong-password",
  ADMIN_PHONE: "05555555555",
  ADMIN_IMAGE: "",
};

test("production accepts strong and different secrets", () => {
  const config = loadConfig(validProductionEnv);

  assert.equal(config.accessTokenSecret.length, 64);
  assert.equal(config.refreshTokenSecret.length, 64);
  assert.equal(config.internalApiKey.length, 64);
});

test("production rejects short secrets and example placeholders", () => {
  assert.throws(
    () => loadConfig({ ...validProductionEnv, ACCESS_TOKEN_SECRET: "short" }),
    /at least 32 characters/,
  );

  assert.throws(
    () =>
      loadConfig({
        ...validProductionEnv,
        INTERNAL_API_KEY: "replace-with-a-long-random-internal-key",
      }),
    /example placeholder/,
  );
});

test("access and refresh token secrets must be different", () => {
  assert.throws(
    () =>
      loadConfig({
        ...validProductionEnv,
        REFRESH_TOKEN_SECRET: validProductionEnv.ACCESS_TOKEN_SECRET,
      }),
    /must be different/,
  );
});
