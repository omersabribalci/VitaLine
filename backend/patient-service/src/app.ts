const express = require("express");
const healthRoutes = require("./routes/healthRoutes.js");
const patientRoutes = require("./routes/patientRoutes.js");
const internalPatientRoutes = require("./routes/internalPatientRoutes.js");
const { internalServiceAuth } = require("./middleware/internalServiceAuth.js");
const { requestLogger } = require("./middleware/requestLogger.js");
const { notFound } = require("./middleware/notFound.js");
const { errorHandler } = require("./middleware/errorHandler.js");

const app = express();

app.disable("x-powered-by");
app.use(requestLogger);
app.use(express.json({ limit: "32kb" }));

app.use(healthRoutes);
app.use("/internal", internalServiceAuth);
app.use("/internal/patients", internalPatientRoutes);
app.use("/api/patients", patientRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
