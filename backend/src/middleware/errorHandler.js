const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server Error";

  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`,
  );

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
