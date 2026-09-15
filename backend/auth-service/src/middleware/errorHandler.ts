type ErrorRequestHandler = import("express").ErrorRequestHandler;
const { AuthSessionError } = require("../services/authSessions.js");
const AppError = require("../utils/AppError.js");

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
  if (error instanceof AuthSessionError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }
  if (error instanceof SyntaxError) {
    res.status(400).json({ success: false, message: "Invalid JSON body." });
    return;
  }

  console.error(
    JSON.stringify({
      service: "auth-service",
      requestId: res.locals.requestId || "unknown",
      message: "Unhandled request error.",
      error: error instanceof Error ? error.message : "Unknown error",
    }),
  );
  res.status(500).json({ success: false, message: "Internal server error." });
};

module.exports = { errorHandler };
