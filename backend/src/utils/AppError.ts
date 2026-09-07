class AppError extends Error {
  statusCode: number;
  errors?: unknown[];
  isOperational: boolean;

  constructor(message: string, statusCode: number, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export = AppError;
