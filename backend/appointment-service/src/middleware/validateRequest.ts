type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
type FieldValidationError = import("express-validator").FieldValidationError;
type ValidationError = import("express-validator").ValidationError;
const { validationResult } = require("express-validator");

const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }

  const details = errors.array().map((error: ValidationError) => ({
    field:
      error.type === "field"
        ? (error as FieldValidationError).path
        : error.type,
    message:
      error.msg instanceof Error ? error.msg.message : String(error.msg),
  }));

  res.status(400).json({
    success: false,
    message: details[0]?.message || "Validation failed.",
    errors: details,
  });
};

module.exports = { validateRequest };
