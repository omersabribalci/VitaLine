const { body } = require("express-validator");
const validate = require("../middleware/validate");

const objectId = (field, label) =>
  body(field).isMongoId().withMessage(`${label} must be a valid ID!`);

const create = [
  objectId("doctorId", "Doctor ID"),
  objectId("patientId", "Patient ID"),
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

module.exports = { create, update };
