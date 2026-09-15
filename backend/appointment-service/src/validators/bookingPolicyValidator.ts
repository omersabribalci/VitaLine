const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest.js");

const allowedFields = new Set([
  "appointmentDurationMinutes",
  "bookingWindowDays",
  "workingTimeStart",
  "workingTimeEnd",
  "workingDays",
  "lunchBreakStart",
  "lunchBreakEnd",
]);
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const validateBookingPolicyUpdate = [
  body().custom((value: unknown) => {
    if (typeof value !== "object" || value === null) {
      throw new Error("At least one booking policy field is required.");
    }
    const fields = Object.keys(value);
    if (fields.length === 0) {
      throw new Error("At least one booking policy field is required.");
    }
    const unknownField = fields.find((field) => !allowedFields.has(field));
    if (unknownField) {
      throw new Error(`Unknown booking policy field: ${unknownField}.`);
    }
    return true;
  }),
  body("appointmentDurationMinutes")
    .optional()
    .custom(
      (value: unknown) =>
        Number.isInteger(value) &&
        Number(value) >= 5 &&
        Number(value) <= 60,
    )
    .withMessage("Appointment duration must be an integer between 5 and 60."),
  body("bookingWindowDays")
    .optional()
    .custom(
      (value: unknown) =>
        Number.isInteger(value) &&
        Number(value) >= 1 &&
        Number(value) <= 365,
    )
    .withMessage("Booking window must be an integer between 1 and 365."),
  body("workingTimeStart")
    .optional()
    .matches(timePattern)
    .withMessage("workingTimeStart must use HH:mm format."),
  body("workingTimeEnd")
    .optional()
    .matches(timePattern)
    .withMessage("workingTimeEnd must use HH:mm format."),
  body("lunchBreakStart")
    .optional({ nullable: true })
    .matches(timePattern)
    .withMessage("lunchBreakStart must be null or use HH:mm format."),
  body("lunchBreakEnd")
    .optional({ nullable: true })
    .matches(timePattern)
    .withMessage("lunchBreakEnd must be null or use HH:mm format."),
  body("workingDays")
    .optional()
    .custom(
      (days: unknown) =>
        Array.isArray(days) &&
        days.length > 0 &&
        days.every(
          (day) => Number.isInteger(day) && Number(day) >= 0 && Number(day) <= 6,
        ) &&
        new Set(days).size === days.length,
    )
    .withMessage("Working days must be unique integers between 0 and 6."),
  validateRequest,
];

module.exports = { validateBookingPolicyUpdate };
