const express = require("express");
const healthRoutes = require("./routes/healthRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const internalUserRoutes = require("./routes/internalUserRoutes.js");
const { internalServiceAuth } = require("./middleware/internalServiceAuth.js");
const { requestLogger } = require("./middleware/requestLogger.js");
const { notFound } = require("./middleware/notFound.js");
const { errorHandler } = require("./middleware/errorHandler.js");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestLogger);
app.use(express.json({ limit: "32kb" }));

app.use(healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/internal", internalServiceAuth);
app.use("/internal/users", internalUserRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
