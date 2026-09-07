const logger = require("./logger");
import type { NextFunction, Request, Response } from "express";

interface ErrorDetail {
  field?: string;
  message: string;
}

interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorDetail[];
}

interface ErrorLike {
  statusCode?: unknown;
  message?: unknown;
  errors?: unknown;
  name?: unknown;
  path?: unknown;
  code?: unknown;
}

const asErrorLike = (error: unknown): ErrorLike =>
  typeof error === "object" && error !== null ? error : {};

const toErrorDetail = (error: unknown): ErrorDetail => {
  const detail = asErrorLike(error);
  return {
    field: typeof detail.path === "string" ? detail.path : undefined,
    message:
      typeof detail.message === "string" ? detail.message : "Unknown error",
  };
};

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const normalizedError = asErrorLike(err);
  let statusCode =
    typeof normalizedError.statusCode === "number"
      ? normalizedError.statusCode
      : 500;
  let message =
    typeof normalizedError.message === "string"
      ? normalizedError.message
      : "Server Error";
  let errors = normalizedError.errors;

  if (normalizedError.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    errors = Object.values(asErrorLike(errors)).map(toErrorDetail);
  } else if (normalizedError.name === "CastError") {
    statusCode = 400;
    const path =
      typeof normalizedError.path === "string" ? normalizedError.path : "field";
    message = `Invalid value for ${path}.`;
  } else if (normalizedError.code === 11000) {
    statusCode = 409;
    message = "A record with the provided values already exists.";
  }

  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`,
  );

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (Array.isArray(errors) && errors.length > 0) {
    response.errors = errors.map(toErrorDetail);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
