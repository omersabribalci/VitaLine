type ErrorRequestHandler = import("express").ErrorRequestHandler;
const AppError = require("../utils/AppError.js");
const mongoose = require("mongoose");

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  if (error instanceof SyntaxError) {
    res.status(400).json({ success: false, message: "Invalid JSON body." });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    const firstError = Object.values(error.errors)[0] as any;
    const message = firstError?.message || "Validation failed.";
    res.status(400).json({ success: false, message });
    return;
  }

  console.error(
    JSON.stringify({
      service: "appointment-service",
      requestId: res.locals.requestId || "unknown",
      message: "Unhandled request error.",
      error: error instanceof Error ? error.message : "Unknown error",
    }),
  );
  res.status(500).json({ success: false, message: "Internal server error." });
};

module.exports = { errorHandler };
