type ServerResponse = import("node:http").ServerResponse;
type IncomingMessage = import("node:http").IncomingMessage;
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { loadConfig } = require("../config/env.js");
const { sendProxyError } = require("../utils/sendProxyError.js");

const router = express.Router();
const config = loadConfig();

const proxyTo = (
  target: string,
  matches: (pathname: string, method: string) => boolean,
) =>
  createProxyMiddleware({
    target,
    changeOrigin: false,
    xfwd: true,
    pathFilter: (pathname: string, req: IncomingMessage) =>
      matches(pathname, req.method || "GET"),
    proxyTimeout: 10_000,
    timeout: 15_000,
    on: {
      error: (error: Error, req: IncomingMessage, res: ServerResponse) => {
        sendProxyError(error, req, res as ServerResponse);
      },
    },
  });

const authRoutesProxy = proxyTo(
  config.authServiceUrl,
  (path) => path.startsWith("/api/auth/"),
);

const patientRoutesProxy = proxyTo(
  config.patientServiceUrl,
  (path) => path.startsWith("/api/patients"),
);

const doctorRoutesProxy = proxyTo(
  config.doctorServiceUrl,
  (path) => path.startsWith("/api/doctors"),
);

const bookingPolicyProxy = proxyTo(
  config.appointmentServiceUrl,
  (path) => path.startsWith("/api/booking-policy"),
);

const appointmentRoutesProxy = proxyTo(
  config.appointmentServiceUrl,
  (path) => path.startsWith("/api/appointments"),
);

router.use(authRoutesProxy);
router.use(patientRoutesProxy);
router.use(doctorRoutesProxy);
router.use(bookingPolicyProxy);
router.use(appointmentRoutesProxy);

module.exports = router;
