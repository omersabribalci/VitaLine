const AppError = require("../utils/AppError");

const getOrigins = () => {
  if (process.env.NODE_ENV === "production") {
    return (process.env.CORS_ORIGIN || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  const configuredOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "https://mf165plz-5173.brs.devtunnels.ms",
    ...configuredOrigins,
  ];
};

const allowedOrigins = new Set(getOrigins());

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    const error = new AppError(
      "CORS Policy: Access is not allowed for this origin.",
      403,
    );

    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

module.exports = { corsOptions };
