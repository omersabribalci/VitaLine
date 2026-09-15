const express = require("express");
const healthRoutes = require("./routes/healthRoutes.js");
const docsRoutes = require("./routes/docsRoutes.js");
const proxyRoutes = require("./routes/proxyRoutes.js");
const { requestLogger } = require("./middleware/requestLogger.js");
const { globalLimiter, authLimiter } = require("./middleware/rateLimiter.js");
const { notFound } = require("./middleware/notFound.js");

const app = express();

app.disable("x-powered-by");
// Production request path: browser -> Coolify proxy -> frontend Nginx -> gateway.
// Trust both proxies so rate limiting uses the real visitor IP.
app.set("trust proxy", 2);

app.use(requestLogger);
app.use(healthRoutes);
app.use(docsRoutes);
app.use("/api/auth", authLimiter);
app.use(globalLimiter);
app.use(proxyRoutes);
app.use(notFound);

module.exports = app;
