const AppError = require("../utils/AppError");

const getOrigins = () => {
  if (process.env.NODE_ENV === "production") {
    return ["https://gercek-domain.com TODO"];
  }

  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
  }
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
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};

module.exports = { corsOptions };
