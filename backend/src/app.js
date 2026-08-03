const express = require("express");
const cors = require("cors");
const appointmentRouter = require("./routes/appointmentRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const patientRouter = require("./routes/patientRoutes");
const morganMiddleware = require("./middleware/morgan");
const errorHandler = require("./middleware/errorHandler");
const { corsOptions } = require("./config/corsOptions");
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(morganMiddleware);

app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);

app.use(errorHandler);

module.exports = app;
