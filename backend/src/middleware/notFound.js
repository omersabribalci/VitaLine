const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
  return next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
