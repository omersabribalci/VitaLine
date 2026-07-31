const express = require("express");
const cors = require("cors");

const appointmentRouter = require("./routes/appointmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/appointments", appointmentRouter);

module.exports = app;
