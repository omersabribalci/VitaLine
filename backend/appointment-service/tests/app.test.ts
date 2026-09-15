const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const test = require("node:test");
const jwt = require("jsonwebtoken");

process.env.ACCESS_TOKEN_SECRET = "appointment-test-access-secret";
process.env.INTERNAL_API_KEY = "appointment-test-internal-key";

const database = require("../src/config/database.js");
const cancellationService = require("../src/services/cancelOwnerAppointments.js");
const creationService = require("../src/services/createAppointment.js");
const directoryService = require("../src/services/appointmentDirectory.js");
const mutationService = require("../src/services/mutateAppointment.js");
const app = require("../src/app.js");

const startServer = async () => {
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No address.");
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
};

const closeServer = (server: any) =>
  new Promise<void>((resolve, reject) =>
    server.close((error: Error | undefined) => error ? reject(error) : resolve()),
  );

const tokenFor = (id: string, role: "admin" | "doctor" | "patient") =>
  jwt.sign({ id, email: `${role}@example.com`, role }, process.env.ACCESS_TOKEN_SECRET);

test("liveness identifies Appointment Service", async (t: any) => {
  t.mock.method(database, "isDatabaseReady", () => false);
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));

  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "appointment-service",
  });
});

test("readiness returns 503 when MongoDB is not ready", async (t: any) => {
  t.mock.method(database, "isDatabaseReady", () => false);
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));

  assert.equal((await fetch(`${baseUrl}/ready`)).status, 503);
});

test("unknown routes return a service-specific 404", async (t: any) => {
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));

  const response = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "Appointment Service route not found.",
  });
});

test("internal cancellation requires service authentication", async (t: any) => {
  let owner = "";
  let ownerId = "";
  t.mock.method(cancellationService, "cancelOwnerAppointments", async (receivedOwner: string, receivedOwnerId: string) => {
    owner = receivedOwner;
    ownerId = receivedOwnerId;
    return { cancelledCount: 2 };
  });
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));
  const id = "68c010000000000000000809";
  const url = `${baseUrl}/internal/appointments/cancel-by-patient/${id}`;

  assert.equal((await fetch(url, { method: "POST" })).status, 401);
  const response = await fetch(url, {
    method: "POST",
    headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
  });

  assert.equal(response.status, 200);
  assert.equal(owner, "patient");
  assert.equal(ownerId, id);
});

test("appointment creation enforces JWT, role, validation and controller contract", async (t: any) => {
  const patientUserId = "68c010000000000000000201";
  t.mock.method(creationService, "createAppointment", async (actor: any, input: any) => {
    assert.equal(actor.id, patientUserId);
    const now = new Date();
    return {
      id: "68c010000000000000000202",
      doctorId: input.doctorId,
      patientId: "68c010000000000000000203",
      dateAndTime: new Date(input.dateAndTime),
      bookingDateKey: "2030-01-07",
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    };
  });
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));
  const url = `${baseUrl}/api/appointments`;

  assert.equal((await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  })).status, 401);

  const doctorToken = tokenFor("68c010000000000000000204", "doctor");
  assert.equal((await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${doctorToken}`, "content-type": "application/json" },
    body: "{}",
  })).status, 403);

  const patientToken = tokenFor(patientUserId, "patient");
  const requestBody = {
    doctorId: "68c010000000000000000205",
    patientId: "68c010000000000000000999",
    dateAndTime: "2030-01-07T09:00",
  };
  assert.equal((await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${patientToken}`, "content-type": "application/json" },
    body: "{}",
  })).status, 400);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${patientToken}`,
      "content-type": "application/json",
      "x-request-id": "appointment-route-request-123",
    },
    body: JSON.stringify(requestBody),
  });
  const body = await response.json() as any;
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("x-request-id"), "appointment-route-request-123");
  assert.equal(body.data._id, "68c010000000000000000202");
});

test("appointment list and detail routes preserve the paginated public contract", async (t: any) => {
  const userId = "68c010000000000000000211";
  const appointmentId = "68c010000000000000000212";
  const appointment = {
    _id: appointmentId,
    doctorId: null,
    patientId: null,
    dateAndTime: new Date("2030-01-07T09:00:00.000Z"),
    status: "scheduled",
    createdAt: new Date("2030-01-01T00:00:00.000Z"),
    updatedAt: new Date("2030-01-01T00:00:00.000Z"),
  };
  t.mock.method(directoryService, "getAppointments", async (actor: any, input: any) => {
    assert.equal(actor.id, userId);
    assert.equal(input.page, 2);
    assert.equal(input.limit, 8);
    assert.equal(input.doctorId, "68c010000000000000000213");
    return { items: [appointment], pagination: { page: 2, limit: 8, totalItems: 9, totalPages: 2 } };
  });
  t.mock.method(directoryService, "getAppointmentById", async (actor: any, receivedId: string) => {
    assert.equal(actor.id, userId);
    assert.equal(receivedId, appointmentId);
    return appointment;
  });
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));
  const routeBase = `${baseUrl}/api/appointments`;
  const headers = { authorization: `Bearer ${tokenFor(userId, "admin")}` };

  assert.equal((await fetch(routeBase)).status, 401);
  const listResponse = await fetch(`${routeBase}?page=2&limit=8&doctorId=68c010000000000000000213`, { headers });
  const listBody = await listResponse.json() as any;
  assert.equal(listResponse.status, 200);
  assert.equal(listBody.data.items[0]._id, appointmentId);
  assert.equal(listBody.data.pagination.totalItems, 9);
  assert.equal((await fetch(`${routeBase}/not-an-id`, { headers })).status, 400);

  const detailResponse = await fetch(`${routeBase}/${appointmentId}`, { headers });
  const detailBody = await detailResponse.json() as any;
  assert.equal(detailResponse.status, 200);
  assert.equal(detailBody.data._id, appointmentId);
});

test("appointment mutation routes enforce validation and role boundaries", async (t: any) => {
  const patientUserId = "68c010000000000000000221";
  const appointmentId = "68c010000000000000000222";
  let deletedId = "";
  t.mock.method(mutationService, "updateAppointment", async (actor: any, receivedId: string, input: any) => {
    assert.equal(actor.id, patientUserId);
    assert.equal(receivedId, appointmentId);
    assert.equal(input.status, "cancelled");
    assert.deepEqual(Object.keys(input).sort(), ["requestId", "status"]);
    const now = new Date();
    return { _id: appointmentId, doctorId: null, patientId: null, dateAndTime: now, status: "cancelled", createdAt: now, updatedAt: now };
  });
  t.mock.method(mutationService, "deleteAppointment", async (receivedId: string) => {
    deletedId = receivedId;
  });
  const { server, baseUrl } = await startServer();
  t.after(() => closeServer(server));
  const url = `${baseUrl}/api/appointments/${appointmentId}`;
  const patientToken = tokenFor(patientUserId, "patient");
  const adminToken = tokenFor("68c010000000000000000223", "admin");

  assert.equal((await fetch(url, {
    method: "PATCH",
    headers: { authorization: `Bearer ${patientToken}`, "content-type": "application/json" },
    body: "{}",
  })).status, 400);
  assert.equal((await fetch(url, {
    method: "PATCH",
    headers: { authorization: `Bearer ${patientToken}`, "content-type": "application/json" },
    body: JSON.stringify({ status: "cancelled" }),
  })).status, 200);
  assert.equal((await fetch(url, {
    method: "DELETE",
    headers: { authorization: `Bearer ${patientToken}` },
  })).status, 403);
  assert.equal((await fetch(url, {
    method: "DELETE",
    headers: { authorization: `Bearer ${adminToken}` },
  })).status, 200);
  assert.equal(deletedId, appointmentId);
});
