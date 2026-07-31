const express = require("express");
const cors = require("cors");

const appointmentRouter = require("./routes/appointmentRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const patientRouter = require("./routes/patientRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);

module.exports = app;
