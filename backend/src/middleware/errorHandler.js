const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";
  let errors = err.errors;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}.`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with the provided values already exists.";
  }

  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`,
  );

  const response = {
    success: false,
    message,
  };

  if (Array.isArray(errors) && errors.length > 0) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
