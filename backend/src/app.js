const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/authRoutes");
const appointmentRouter = require("./routes/appointmentRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const patientRouter = require("./routes/patientRoutes");
const morganMiddleware = require("./middleware/morgan");
const errorHandler = require("./middleware/errorHandler");
const { corsOptions } = require("./config/corsOptions");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const notFound = require("./middleware/notFound");
const { globalLimiter } = require("./middleware/ratelimiter");
const app = express();
const cookieParser = require("cookie-parser");

app.set("trust proxy", 1); // ????

app.use(cors(corsOptions));
app.use(express.json());
app.use(morganMiddleware);
app.use(cookieParser());
app.use(globalLimiter);
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
}
app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);

app.use(notFound);

app.use(errorHandler);

module.exports = app;
