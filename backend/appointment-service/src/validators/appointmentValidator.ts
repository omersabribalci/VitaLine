type RequestHandler = import("express").RequestHandler;
const { body, param, query } = require("express-validator");
const { format, isValid, parse } = require("date-fns");
const { validateRequest } = require("../middleware/validateRequest.js");
const { APPOINTMENT_STATUSES } = require("../types/index.js");

const normalizeAppointmentListQuery: RequestHandler = (req, res, next) => {
  const doctorId =
    typeof req.query.doctorId === "string" ? req.query.doctorId : undefined;
  const patientId =
    typeof req.query.patientId === "string" ? req.query.patientId : undefined;

  res.locals.appointmentListQuery = {
    page: req.query.page === undefined ? 1 : Number(req.query.page),
    limit: req.query.limit === undefined ? 10 : Number(req.query.limit),
    ...(doctorId ? { doctorId } : {}),
    ...(patientId ? { patientId } : {}),
  };
  next();
};

const validateAppointmentListQuery = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be an integer between 1 and 100."),
  query("doctorId")
    .optional()
    .isMongoId()
    .withMessage("doctorId must be a valid ID."),
  query("patientId")
    .optional()
    .isMongoId()
    .withMessage("patientId must be a valid ID."),
  validateRequest,
  normalizeAppointmentListQuery,
];

const validateAppointmentIdParam = [
  param("id")
    .isMongoId()
    .withMessage("A valid appointment ID is required."),
  validateRequest,
];

const validateAvailabilityQuery = [
  query("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required.")
    .bail()
    .isMongoId()
    .withMessage("Doctor ID must be a valid ID."),
  query("date")
    .notEmpty()
    .withMessage("Date is required.")
    .bail()
    .custom((value: unknown) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }
      const parsedDate = parse(value, "yyyy-MM-dd", new Date());
      return isValid(parsedDate) && format(parsedDate, "yyyy-MM-dd") === value;
    })
    .withMessage("Date must use a real date in YYYY-MM-DD format."),
  validateRequest,
];

const validateCreateAppointment = [
  body("doctorId")
    .isMongoId()
    .withMessage("Doctor ID must be valid."),
  body("patientId")
    .optional()
    .isMongoId()
    .withMessage("Patient ID must be valid."),
  body("patientId")
    .custom((value: unknown, { req }: any) => {
      const role = req.res?.locals.authUser?.role;
      return role !== "admin" || (typeof value === "string" && value.length > 0);
    })
    .withMessage("Patient ID is required for an admin booking."),
  body("dateAndTime")
    .isString()
    .withMessage("Date and time must be a valid ISO date.")
    .bail()
    .isLength({ max: 64 })
    .isISO8601()
    .withMessage("Date and time must be a valid ISO date."),
  body("status")
    .optional()
    .isIn([...APPOINTMENT_STATUSES])
    .withMessage("Status must be scheduled, completed, or cancelled.")
    .bail()
    .custom((_value: unknown, { req }: any) =>
      req.res?.locals.authUser?.role === "admin",
    )
    .withMessage("Only an admin can provide an appointment status."),
  validateRequest,
];

const appointmentUpdateFields = new Set([
  "doctorId",
  "patientId",
  "dateAndTime",
  "status",
]);

const validateUpdateAppointment = [
  body().custom((value: unknown) => {
    if (typeof value !== "object" || value === null) {
      throw new Error("At least one appointment field is required.");
    }
    const fields = Object.keys(value);
    if (fields.length === 0) {
      throw new Error("At least one appointment field is required.");
    }
    const unsupported = fields.find(
      (field) => !appointmentUpdateFields.has(field),
    );
    if (unsupported) {
      throw new Error(`Unsupported appointment field: ${unsupported}.`);
    }
    return true;
  }),
  body("doctorId")
    .optional()
    .isMongoId()
    .withMessage("Doctor ID must be valid."),
  body("patientId")
    .optional()
    .isMongoId()
    .withMessage("Patient ID must be valid."),
  body("dateAndTime")
    .optional()
    .isString()
    .bail()
    .isLength({ max: 64 })
    .isISO8601()
    .withMessage("Date and time must be a valid ISO date."),
  body("status")
    .optional()
    .isIn([...APPOINTMENT_STATUSES])
    .withMessage("Status must be scheduled, completed, or cancelled."),
  validateRequest,
];

module.exports = {
  validateAppointmentListQuery,
  validateAppointmentIdParam,
  validateAvailabilityQuery,
  validateCreateAppointment,
  validateUpdateAppointment,
};
