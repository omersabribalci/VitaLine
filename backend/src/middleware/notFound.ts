const AppError = require("../utils/AppError");
import type { NextFunction, Request, Response } from "express";

const notFound = (req: Request, _res: Response, next: NextFunction) => {
  return next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = notFound;
