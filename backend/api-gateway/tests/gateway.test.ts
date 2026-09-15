const assert = require("node:assert/strict");
type Server = import("node:http").Server;
type IncomingMessage = import("node:http").IncomingMessage;
type ServerResponse = import("node:http").ServerResponse;
type TestContext = import("node:test").TestContext;
const { createServer } = require("node:http");
const test = require("node:test");

type GatewayUpstreams = {
  authServiceUrl: string;
  patientServiceUrl: string;
  doctorServiceUrl: string;
  appointmentServiceUrl: string;
};

const listen = async (server: Server): Promise<number> => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server address could not be resolved.");
  }

  return address.port;
};

const allUpstreamsAt = (url: string): GatewayUpstreams => ({
  authServiceUrl: url,
  patientServiceUrl: url,
  doctorServiceUrl: url,
  appointmentServiceUrl: url,
});

const loadGatewayApp = (upstreams: GatewayUpstreams) => {
  process.env.AUTH_SERVICE_URL = upstreams.authServiceUrl;
  process.env.PATIENT_SERVICE_URL = upstreams.patientServiceUrl;
  process.env.DOCTOR_SERVICE_URL = upstreams.doctorServiceUrl;
  process.env.APPOINTMENT_SERVICE_URL = upstreams.appointmentServiceUrl;

  delete require.cache[require.resolve("../src/app.js")];
  delete require.cache[require.resolve("../src/routes/proxyRoutes.js")];

  return require("../src/app.js");
};

test("gateway keeps the API path, body and request ID while proxying", async (t: TestContext) => {
  const upstream = createServer((req: IncomingMessage, res: ServerResponse) => {
    let body = "";

    req.on("data", (chunk: Buffer) => {
      body += chunk;
    });

    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          method: req.method,
          url: req.url,
          requestId: req.headers["x-request-id"],
          body,
        }),
      );
    });
  });
  const upstreamPort = await listen(upstream);
  t.after(() => upstream.close());

  const app = loadGatewayApp(
    allUpstreamsAt(`http://127.0.0.1:${upstreamPort}`),
  );
  const gateway = createServer(app);
  const gatewayPort = await listen(gateway);
  t.after(() => gateway.close());

  const response = await fetch(
    `http://127.0.0.1:${gatewayPort}/api/auth/login?source=test`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    },
  );
  const data = (await response.json()) as {
    method: string;
    url: string;
    requestId: string;
    body: string;
  };

  assert.equal(response.status, 200);
  assert.equal(data.method, "POST");
  assert.equal(data.url, "/api/auth/login?source=test");
  assert.ok(data.requestId);
  assert.deepEqual(JSON.parse(data.body), { email: "test@example.com" });
  assert.equal(response.headers.get("x-request-id"), data.requestId);
});

test("gateway health endpoint does not depend on the backend", async (t: TestContext) => {
  const app = loadGatewayApp(allUpstreamsAt("http://127.0.0.1:1"));
  const gateway = createServer(app);
  const gatewayPort = await listen(gateway);
  t.after(() => gateway.close());

  const response = await fetch(`http://127.0.0.1:${gatewayPort}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("gateway serves the consolidated OpenAPI contract and Swagger UI", async (t: TestContext) => {
  const app = loadGatewayApp(allUpstreamsAt("http://127.0.0.1:1"));
  const gateway = createServer(app);
  const gatewayPort = await listen(gateway);
  t.after(() => gateway.close());

  const contractResponse = await fetch(
    "http://127.0.0.1:" + gatewayPort + "/api-docs.json",
  );
  const contract = (await contractResponse.json()) as {
    openapi: string;
    paths: Record<string, unknown>;
  };
  assert.equal(contractResponse.status, 200);
  assert.equal(contract.openapi, "3.1.0");
  assert.ok(contract.paths["/api/auth/login"]);
  assert.ok(contract.paths["/api/appointments"]);

  const uiResponse = await fetch(
    "http://127.0.0.1:" + gatewayPort + "/api-docs/",
  );
  assert.equal(uiResponse.status, 200);
  assert.match(await uiResponse.text(), /VitaLine API Documentation/);
});

test("an unmapped API path does not fall back to the retired monolith", async (t: TestContext) => {
  const app = loadGatewayApp(allUpstreamsAt("http://127.0.0.1:1"));
  const gateway = createServer(app);
  const gatewayPort = await listen(gateway);
  t.after(() => gateway.close());

  const response = await fetch(
    `http://127.0.0.1:${gatewayPort}/api/retired-monolith-route`,
  );
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    success: false,
    message: "Gateway route not found.",
  });
});

test("gateway routes API owners by path and HTTP method", async (t: TestContext) => {
  const createUpstream = async (name: string) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ name, method: req.method, url: req.url }));
    });
    const port = await listen(server);
    t.after(() => server.close());
    return `http://127.0.0.1:${port}`;
  };

  const upstreams: GatewayUpstreams = {
    authServiceUrl: await createUpstream("auth"),
    patientServiceUrl: await createUpstream("patient"),
    doctorServiceUrl: await createUpstream("doctor"),
    appointmentServiceUrl: await createUpstream("appointment"),
  };
  const app = loadGatewayApp(upstreams);
  const gateway = createServer(app);
  const gatewayPort = await listen(gateway);
  t.after(() => gateway.close());

  const request = async (path: string, method = "GET") => {
    const response = await fetch(`http://127.0.0.1:${gatewayPort}${path}`, {
      method,
    });
    return (await response.json()) as { name: string };
  };

  assert.equal((await request("/api/auth/login", "POST")).name, "auth");
  assert.equal((await request("/api/doctors", "POST")).name, "doctor");
  assert.equal((await request("/api/doctors")).name, "doctor");
  assert.equal(
    (await request(`/api/doctors/${"b".repeat(24)}`, "DELETE")).name,
    "doctor",
  );
  assert.equal(
    (await request(`/api/doctors/${"a".repeat(24)}`, "DELETE")).name,
    "doctor",
  );
  assert.equal((await request("/api/patients")).name, "patient");
  assert.equal((await request("/api/appointments")).name, "appointment");
  assert.equal((await request("/api/booking-policy")).name, "appointment");
  assert.equal(
    (await request("/api/appointments/statistics")).name,
    "appointment",
  );
  assert.equal(
    (await request(`/api/patients/${"a".repeat(24)}`, "DELETE")).name,
    "patient",
  );
});
