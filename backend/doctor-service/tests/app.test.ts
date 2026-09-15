const assert: typeof import("node:assert/strict") = require("node:assert/strict");
type Server = import("node:http").Server;
const { createServer } = require("node:http");
const test: typeof import("node:test") = require("node:test");
const { Types } = require("mongoose");
const jwt = require("jsonwebtoken");

process.env.INTERNAL_API_KEY = "test-internal-api-key";
process.env.ACCESS_TOKEN_SECRET = "doctor-public-route-access-secret";

const database = require("../src/config/database.js");
const doctorService = require("../src/services/doctorService.js");
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

test("liveness and readiness have separate database semantics", async (t) => {
  let ready = false;
  t.mock.method(database, "isDatabaseReady", () => ready);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  assert.equal((await fetch(`http://127.0.0.1:${port}/health`)).status, 200);
  assert.equal((await fetch(`http://127.0.0.1:${port}/ready`)).status, 503);
  ready = true;
  assert.equal((await fetch(`http://127.0.0.1:${port}/ready`)).status, 200);
});

test("internal endpoint rejects calls without the service key", async (t) => {
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(`http://127.0.0.1:${port}/internal/doctors`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userId: new Types.ObjectId().toString(),
      title: "Dr.",
      speciality: "Cardiology",
    }),
  });

  assert.equal(response.status, 401);
});

test("internal count returns only the Doctor Service-owned total", async (t) => {
  t.mock.method(doctorService, "countDoctors", async () => 4);
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/doctors/count`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    data: { count: 4 },
  });
});

test("internal lookup returns the Doctor-owned booking profile", async (t) => {
  const doctorId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  t.mock.method(doctorService, "getDoctorForAppointment", async () => ({
    id: doctorId,
    userId,
    title: "Dr.",
    speciality: "Cardiology",
    unavailableDates: [],
  }));
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/doctors/${doctorId}`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );
  assert.equal(response.status, 200);
});

test("internal doctor lookup validates the identifier", async (t) => {
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const response = await fetch(
    `http://127.0.0.1:${port}/internal/doctors/not-an-id`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );
  assert.equal(response.status, 400);
});

test("internal doctor lookup resolves an Auth user ID", async (t) => {
  const userId = new Types.ObjectId().toString();
  t.mock.method(doctorService, "getDoctorForAppointmentByUserId", async () => ({
    id: new Types.ObjectId().toString(),
    userId,
    title: "Dr.",
    speciality: "Cardiology",
    unavailableDates: [],
  }));
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/doctors/by-user/${userId}`,
    { headers: { "x-internal-api-key": internalApiKey } },
  );
  assert.equal(response.status, 200);
});

test("internal bulk lookup resolves doctor profiles", async (t) => {
  const firstId = new Types.ObjectId().toString();
  const secondId = new Types.ObjectId().toString();
  t.mock.method(doctorService, "resolveDoctorsForAppointments", async (ids: string[]) =>
    ids.map((id) => ({
      id,
      userId: new Types.ObjectId().toString(),
      title: "Dr.",
      speciality: "Cardiology",
      unavailableDates: [],
    })),
  );
  const { server, port } = await startTestServer();
  t.after(() => close(server));

  const response = await fetch(
    `http://127.0.0.1:${port}/internal/doctors/resolve`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": internalApiKey,
      },
      body: JSON.stringify({ doctorIds: [secondId, firstId] }),
    },
  );
  assert.equal(response.status, 200);
});

test("internal bulk doctor lookup validates its ID list", async (t) => {
  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const response = await fetch(
    `http://127.0.0.1:${port}/internal/doctors/resolve`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-key": internalApiKey,
      },
      body: JSON.stringify({ doctorIds: [] }),
    },
  );
  assert.equal(response.status, 400);
});

test("public doctor routes preserve auth, update and delete behavior", async (t) => {
  const userId = new Types.ObjectId().toString();
  const doctorId = new Types.ObjectId().toString();
  const doctor = {
    _id: doctorId,
    userId: {
      _id: userId,
      name: "Public Doctor",
      email: "doctor@example.com",
      phone: "05555555555",
      image: "",
      role: "doctor",
    },
    title: "Dr.",
    speciality: "Cardiology",
    unavailableDates: [],
  };

  t.mock.method(doctorService, "getDoctors", async () => ({
    items: [doctor],
    pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
  }));
  t.mock.method(doctorService, "getDoctorByUserId", async () => doctor);
  t.mock.method(doctorService, "getDoctorById", async () => doctor);
  t.mock.method(doctorService, "createDoctor", async () => ({
    user: doctor.userId,
    doctor: {
      id: doctorId,
      userId,
      title: doctor.title,
      speciality: doctor.speciality,
      unavailableDates: [],
    },
  }));
  t.mock.method(doctorService, "updateDoctor", async () => undefined);
  t.mock.method(doctorService, "deleteDoctor", async () => undefined);

  const { server, port } = await startTestServer();
  t.after(() => close(server));
  const baseUrl = `http://127.0.0.1:${port}/api/doctors`;

  assert.equal((await fetch(baseUrl)).status, 401);

  const patientToken = jwt.sign(
    { id: new Types.ObjectId().toString(), email: "patient@example.com", role: "patient" },
    accessTokenSecret,
  );
  assert.equal((await fetch(baseUrl, {
    headers: { authorization: `Bearer ${patientToken}` },
  })).status, 200);

  const doctorToken = jwt.sign(
    { id: userId, email: "doctor@example.com", role: "doctor" },
    accessTokenSecret,
  );
  assert.equal((await fetch(`${baseUrl}/me`, {
    headers: { authorization: `Bearer ${doctorToken}` },
  })).status, 200);
  assert.equal((await fetch(`${baseUrl}/${doctorId}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${doctorToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ speciality: "Neurology" }),
  })).status, 200);
  assert.equal((await fetch(`${baseUrl}/${doctorId}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${doctorToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ name: "Updated Doctor" }),
  })).status, 200);
  assert.equal((await fetch(`${baseUrl}/not-an-id`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${doctorToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ speciality: "Neurology" }),
  })).status, 400);

  const adminToken = jwt.sign(
    { id: new Types.ObjectId().toString(), email: "admin@example.com", role: "admin" },
    accessTokenSecret,
  );
  assert.equal((await fetch(baseUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${adminToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: "Public Doctor",
      email: "doctor@example.com",
      phone: "05555555555",
      password: "Strong123",
      image: "",
      title: "Dr.",
      speciality: "Cardiology",
    }),
  })).status, 201);
  assert.equal((await fetch(`${baseUrl}/${doctorId}`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${adminToken}` },
  })).status, 200);
});
