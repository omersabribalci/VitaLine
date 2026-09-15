const assert: typeof import("node:assert/strict") = require("node:assert/strict");
type Server = import("node:http").Server;
const { createServer }: typeof import("node:http") = require("node:http");
const test: typeof import("node:test") = require("node:test");
const { Types } = require("mongoose");
const jwt = require("jsonwebtoken");

process.env.INTERNAL_API_KEY = "test-internal-api-key";
process.env.ACCESS_TOKEN_SECRET = "patient-public-route-access-secret";

const patientService = require("../src/services/patientService.js");
const app = require("../src/app.js");

const internalApiKey = process.env.INTERNAL_API_KEY;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

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

test("internal endpoint rejects calls without the service key", async (t) => {
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(`http://127.0.0.1:${port}/internal/patients`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId: new Types.ObjectId().toString() }),
  });

  assert.equal(response.status, 401);
});

test("internal count returns only the Patient Service-owned total", async (t) => {
  t.mock.method(patientService, "countPatients", async () => 7);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/count`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: { count: 7 },
  });
});

test("internal endpoint creates a patient profile", async (t) => {
  const userId = new Types.ObjectId();
  t.mock.method(
    patientService,
    "registerPatientProfile",
    async (receivedUserId: string) => ({
      id: new Types.ObjectId().toString(),
      userId: receivedUserId,
      accountStatus: "enabled",
    }),
  );
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(`http://127.0.0.1:${port}/internal/patients`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-api-key": internalApiKey,
      "x-request-id": "request-123",
    },
    body: JSON.stringify({ userId: userId.toString() }),
  });

  assert.equal(response.status, 201);
  assert.equal(response.headers.get("x-request-id"), "request-123");
  const body = (await response.json()) as { data: { patient: { userId: string } } };
  assert.equal(body.data.patient.userId, userId.toString());
});

test("internal status endpoint returns the patient for an Auth user", async (t) => {
  const userId = new Types.ObjectId();
  const patientId = new Types.ObjectId().toString();
  t.mock.method(patientService, "getPatientForAppointmentByUserId", async () => ({
    id: patientId,
    userId: userId.toString(),
    accountStatus: "enabled",
  }));
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/by-user/${userId}`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );
  const body = (await response.json()) as {
    data: { patient: { id: string; userId: string; accountStatus: string } };
  };

  assert.equal(response.status, 200);
  assert.deepEqual(body.data.patient, {
    id: patientId,
    userId: userId.toString(),
    accountStatus: "enabled",
  });
});

test("internal status endpoint returns 404 when profile does not exist", async (t) => {
  t.mock.method(patientService, "getPatientForAppointmentByUserId", async () => null);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/by-user/${new Types.ObjectId()}`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );

  assert.equal(response.status, 404);
});

test("internal lookup returns the Patient-owned booking profile", async (t) => {
  const patientId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  t.mock.method(patientService, "getPatientForAppointment", async () => ({
    id: patientId,
    userId,
    accountStatus: "enabled",
  }));
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/${patientId}`,
    {
      headers: {
        "x-internal-api-key": internalApiKey,
        "x-request-id": "appointment-request-456",
      },
    },
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-request-id"), "appointment-request-456");
});

test("internal patient lookup validates the identifier", async (t) => {
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/not-an-id`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );
  assert.equal(response.status, 400);
});

test("internal bulk lookup resolves patient profiles", async (t) => {
  const firstId = new Types.ObjectId().toString();
  const secondId = new Types.ObjectId().toString();
  t.mock.method(
    patientService,
    "resolvePatientsForAppointments",
    async (patientIds: string[]) =>
      patientIds.map((id) => ({
        id,
        userId: new Types.ObjectId().toString(),
        accountStatus: "enabled",
      })),
  );
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/resolve`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": internalApiKey,
      },
      body: JSON.stringify({ patientIds: [secondId, firstId] }),
    },
  );

  assert.equal(response.status, 200);
});

test("internal bulk lookup validates its ID list", async (t) => {
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/patients/resolve`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": internalApiKey,
      },
      body: JSON.stringify({ patientIds: [] }),
    },
  );
  assert.equal(response.status, 400);
});

test("public routes preserve role, list, profile, update and delete behavior", async (t) => {
  const userId = new Types.ObjectId().toString();
  const patientId = new Types.ObjectId().toString();
  const patient = {
    _id: patientId,
    userId: {
      _id: userId,
      name: "Public Patient",
      email: "patient@example.com",
      phone: "05555555555",
      image: "",
      role: "patient",
    },
    accountStatus: "enabled",
  };

  t.mock.method(patientService, "getPatients", async () => ({
    items: [patient],
    pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
  }));
  t.mock.method(patientService, "getPatientByUserId", async () => patient);
  t.mock.method(patientService, "getPatientById", async () => patient);
  t.mock.method(patientService, "updatePatient", async () => patient);
  t.mock.method(patientService, "deletePatient", async () => undefined);

  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const baseUrl = `http://127.0.0.1:${port}/api/patients`;

  assert.equal((await fetch(baseUrl)).status, 401);

  const patientToken = jwt.sign(
    { id: userId, email: "patient@example.com", role: "patient" },
    accessTokenSecret,
  );
  assert.equal(
    (await fetch(baseUrl, {
      headers: { authorization: `Bearer ${patientToken}` },
    })).status,
    403,
  );
  assert.equal(
    (await fetch(`${baseUrl}/me`, {
      headers: { authorization: `Bearer ${patientToken}` },
    })).status,
    200,
  );
  assert.equal(
    (await fetch(`${baseUrl}/${patientId}`, {
      headers: { authorization: `Bearer ${patientToken}` },
    })).status,
    403,
  );

  const adminToken = jwt.sign(
    { id: new Types.ObjectId().toString(), email: "admin@example.com", role: "admin" },
    accessTokenSecret,
  );
  assert.equal(
    (await fetch(baseUrl, {
      headers: { authorization: `Bearer ${adminToken}` },
    })).status,
    200,
  );
  assert.equal(
    (await fetch(`${baseUrl}/${patientId}`, {
      headers: { authorization: `Bearer ${adminToken}` },
    })).status,
    200,
  );
  assert.equal(
    (await fetch(`${baseUrl}/${patientId}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ accountStatus: "disabled" }),
    })).status,
    200,
  );
  assert.equal(
    (await fetch(`${baseUrl}/${patientId}`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ accountStatus: "unknown" }),
    })).status,
    400,
  );
  assert.equal(
    (await fetch(`${baseUrl}/${patientId}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${adminToken}` },
    })).status,
    200,
  );
});
