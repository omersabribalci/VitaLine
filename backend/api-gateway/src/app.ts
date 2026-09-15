const express = require("express");
const healthRoutes = require("./routes/healthRoutes.js");
const docsRoutes = require("./routes/docsRoutes.js");
const proxyRoutes = require("./routes/proxyRoutes.js");
const { requestLogger } = require("./middleware/requestLogger.js");
const { notFound } = require("./middleware/notFound.js");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(requestLogger);
app.use(healthRoutes);
app.use(docsRoutes);
app.use(proxyRoutes);
app.use(notFound);

module.exports = app;
