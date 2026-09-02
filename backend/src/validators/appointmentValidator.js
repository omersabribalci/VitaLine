const { body, query } = require("express-validator");
const validate = require("../middleware/validate");

const objectId = (field, label) =>
  body(field).isMongoId().withMessage(`${label} must be a valid ID!`);

const availability = [
  query("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required!")
    .isMongoId()
    .withMessage("Doctor ID must be a valid ID!"),
  query("date")
    .notEmpty()
    .withMessage("Date is required!")
    .isISO8601()
    .withMessage("Date must be a valid date in YYYY-MM-DD format!"),
  validate,
];

const create = [
  objectId("doctorId", "Doctor ID"),
  body("patientId")
    .if((_, { req }) => req.user?.role === "admin")
    .notEmpty()
    .withMessage("Patient ID is required!")
    .isMongoId()
    .withMessage("Patient ID must be a valid ID!"),
  body("dateAndTime")
    .isISO8601()
    .withMessage("Date and time must be a valid date!"),
  body("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled"])
    .withMessage("Status must be scheduled, completed, or cancelled!"),
  validate,
];

const update = [
  body("doctorId")
    .optional()
    .isMongoId()
    .withMessage("Doctor ID must be a valid ID!"),
  body("patientId")
    .optional()
    .isMongoId()
    .withMessage("Patient ID must be a valid ID!"),
  body("dateAndTime")
    .optional()
    .isISO8601()
    .withMessage("Date and time must be a valid date!"),
  body("status")
    .optional()
    .isIn(["scheduled", "completed", "cancelled"])
    .withMessage("Status must be scheduled, completed, or cancelled!"),
  validate,
];

module.exports = { create, update, availability };
