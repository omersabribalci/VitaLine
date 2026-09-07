const { validationResult } = require("express-validator");
import type { NextFunction, Request, Response } from "express";
import type { FieldValidationError, ValidationError } from "express-validator";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((error: ValidationError) => ({
      field:
        error.type === "field"
          ? (error as FieldValidationError).path
          : error.type,
      message:
        error.msg instanceof Error ? error.msg.message : String(error.msg),
    }));

    return res.status(400).json({
      success: false,
      message: details[0]?.message || "Validation failed.",
      errors: details,
    });
  }
  next();
};
export = validate;
