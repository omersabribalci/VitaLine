const assert = require("node:assert/strict");
type Server = import("node:http").Server;
const { createServer } = require("node:http");
const test = require("node:test");
const { Types } = require("mongoose");

process.env.INTERNAL_API_KEY = "test-internal-api-key";
process.env.ACCESS_TOKEN_SECRET = "auth-test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "auth-test-refresh-secret";
process.env.NODE_ENV = "test";

const internalApiKey = process.env.INTERNAL_API_KEY || "";

const database = require("../src/config/database.js");
const sessionService = require("../src/services/authSessions.js");
const registrationService = require("../src/services/registerPatient.js");
const userService = require("../src/services/userService.js");
const app = require("../src/app.js");

const listen = async (server: Server): Promise<number> => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No address.");
  return address.port;
};

const close = (server: Server) =>
  new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

const startTestServer = async () => {
  const server = createServer(app);
  const port = await listen(server);
  return { server, port };
};

const sessionResult = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: {
    _id: "507f1f77bcf86cd799439011",
    name: "Test Patient",
    email: "patient@example.com",
    phone: "05555555555",
    image: "",
    role: "patient",
  },
};

test("liveness succeeds without checking MongoDB", async (t: any) => {
  t.mock.method(database, "isDatabaseReady", () => false);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(response.status, 200);
});

test("readiness reports whether MongoDB is available", async (t: any) => {
  let ready = false;
  t.mock.method(database, "isDatabaseReady", () => ready);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  assert.equal((await fetch(`http://127.0.0.1:${port}/ready`)).status, 503);
  ready = true;
  assert.equal((await fetch(`http://127.0.0.1:${port}/ready`)).status, 200);
});

test("registration preserves the frontend response contract", async (t: any) => {
  const userId = "507f1f77bcf86cd799439011";
  const patientId = "507f1f77bcf86cd799439012";
  const body = {
    name: "Test Patient",
    email: "patient@example.com",
    phone: "05555555555",
    password: "Strong123",
    confirmPassword: "Strong123",
    image: "",
  };
  t.mock.method(registrationService, "registerPatient", async () => {
    return {
      user: { _id: userId, name: body.name, email: body.email, phone: body.phone, image: "", role: "patient" },
      patient: { id: patientId, userId, accountStatus: "enabled" },
    };
  });
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const url = `http://127.0.0.1:${port}/api/auth/register`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseBody = (await response.json()) as { data: { patient: { _id: string } } };
  assert.equal(response.status, 201);
  assert.equal(responseBody.data.patient._id, patientId);
});

test("login, refresh and logout preserve the frontend session contract", async (t: any) => {
  let loginCalls = 0;
  let refreshToken = "";
  let logoutToken = "";
  t.mock.method(sessionService, "login", async () => {
    loginCalls += 1;
    return sessionResult;
  });
  t.mock.method(sessionService, "refresh", async (token: string) => {
    refreshToken = token;
    return { ...sessionResult, refreshToken: "rotated-refresh-token" };
  });
  t.mock.method(sessionService, "logout", async (token: string) => {
    logoutToken = token;
  });
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const baseUrl = `http://127.0.0.1:${port}/api/auth`;

  const loginResponse = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "PATIENT@EXAMPLE.COM", password: "Strong123" }),
  });
  assert.equal(loginResponse.status, 200);
  assert.equal(loginCalls, 1);
  assert.match(loginResponse.headers.get("set-cookie") || "", /HttpOnly/);

  const refreshResponse = await fetch(`${baseUrl}/refresh`, {
    method: "POST",
    headers: { cookie: "refresh_token=refresh-token" },
  });
  assert.equal(refreshResponse.status, 200);
  assert.equal(refreshToken, "refresh-token");

  const logoutResponse = await fetch(`${baseUrl}/logout`, {
    method: "POST",
    headers: { cookie: "refresh_token=rotated-refresh-token" },
  });
  assert.equal(logoutResponse.status, 200);
  assert.equal(logoutToken, "rotated-refresh-token");
});

test("production login sets a secure refresh cookie", async (t: any) => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  t.after(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  t.mock.method(sessionService, "login", async () => sessionResult);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: "patient@example.com",
      password: "Strong123",
    }),
  });

  const cookie = response.headers.get("set-cookie") || "";
  assert.equal(response.status, 200);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Path=\/api\/auth/);
});

test("internal endpoint creates a doctor user", async (t: any) => {
  const userId = new Types.ObjectId().toString();
  t.mock.method(userService, "createDoctorUser", async () => ({
    _id: userId,
    name: "Test Doctor",
    email: "doctor@example.com",
    phone: "05555555555",
    image: "",
    role: "doctor",
  }));
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/users/doctors`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": internalApiKey,
      },
      body: JSON.stringify({
        name: "Test Doctor",
        email: "doctor@example.com",
        phone: "05555555555",
        password: "Strong123",
        image: "",
      }),
    },
  );

  assert.equal(response.status, 201);
  assert.equal((await response.json()).data.user._id, userId);
});

test("internal user resolution is protected", async (t: any) => {
  const userId = new Types.ObjectId().toString();
  let receivedIds: string[] = [];
  t.mock.method(userService, "resolveUsers", async (ids: string[]) => {
    receivedIds = ids;
    return [{ _id: userId, name: "Doctor", email: "d@example.com", phone: "05555555555", image: "", role: "doctor" }];
  });
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const url = `http://127.0.0.1:${port}/internal/users/resolve`;
  const body = JSON.stringify({ userIds: [userId, userId] });

  assert.equal((await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body })).status, 401);
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-internal-api-key": internalApiKey },
    body,
  });
  assert.equal(response.status, 200);
  assert.deepEqual(receivedIds, [userId]);
});

test("internal user deactivation requires the service key", async (t: any) => {
  const userId = new Types.ObjectId().toString();
  t.mock.method(userService, "deactivateUser", async () => ({ replayed: false }));
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const url = `http://127.0.0.1:${port}/internal/users/${userId}/deactivate`;

  assert.equal((await fetch(url, { method: "POST" })).status, 401);
  assert.equal((await fetch(url, {
    method: "POST",
    headers: { "x-internal-api-key": internalApiKey },
  })).status, 200);
});

test("internal doctor-user profile update requires service auth", async (t: any) => {
  const userId = new Types.ObjectId().toString();
  let calls = 0;
  t.mock.method(userService, "updateUserProfile", async () => {
    calls += 1;
    return { _id: userId, name: "Updated Doctor" };
  });
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const url = `http://127.0.0.1:${port}/internal/users/${userId}/profile`;

  assert.equal((await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Updated Doctor" }),
  })).status, 401);
  assert.equal((await fetch(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-internal-api-key": internalApiKey,
    },
    body: JSON.stringify({ password: "MustNotCrossBoundary123" }),
  })).status, 400);
  assert.equal((await fetch(url, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "x-internal-api-key": internalApiKey,
    },
    body: JSON.stringify({ name: "Updated Doctor" }),
  })).status, 200);
  assert.equal(calls, 1);
});
