const express = require("express");
const healthRoutes = require("./routes/healthRoutes.js");
const appointmentRoutes = require("./routes/appointmentRoutes.js");
const bookingPolicyRoutes = require("./routes/bookingPolicyRoutes.js");
const internalAppointmentRoutes = require("./routes/internalAppointmentRoutes.js");
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
app.use("/internal/appointments", internalAppointmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/booking-policy", bookingPolicyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
