const { body, param } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest.js");

const allowedProfileFields = new Set(["name", "email", "phone", "image"]);

const validateUserResolution = [
  body("userIds")
    .isArray({ min: 1, max: 500 })
    .withMessage("userIds must contain between 1 and 500 valid user IDs.")
    .bail(),
  body("userIds.*")
    .isMongoId()
    .withMessage("userIds must contain between 1 and 500 valid user IDs."),
  body("userIds").customSanitizer((ids: unknown) =>
    Array.isArray(ids) ? [...new Set(ids)] : ids,
  ),
  validateRequest,
];

const validateInternalDoctorUserCreation = [
  body("name").trim().isLength({ min: 3, max: 30 }),
  body("email").trim().isEmail().isLength({ max: 255 }),
  body("phone").trim().matches(/^\d{11}$/),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/),
  body("image").optional().isString(),
  validateRequest,
];

const validateInternalUserProfileUpdate = [
  param("id").isMongoId().withMessage("A valid user ID is required."),
  body().custom((value: unknown) => {
    if (typeof value !== "object" || value === null) {
      throw new Error("At least one user profile field is required.");
    }
    const fields = Object.keys(value);
    if (fields.length === 0) {
      throw new Error("At least one user profile field is required.");
    }
    if (fields.some((field) => !allowedProfileFields.has(field))) {
      throw new Error("Only name, email, phone and image can be updated here.");
    }
    return true;
  }),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Name must contain between 3 and 30 characters."),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("A valid email address is required.")
    .isLength({ max: 255 })
    .withMessage("Email can contain at most 255 characters."),
  body("phone")
    .optional()
    .trim()
    .matches(/^\d{11}$/)
    .withMessage("Phone must contain exactly 11 digits."),
  body("image").optional().isString().withMessage("Image must be a string."),
  validateRequest,
];

const validateInternalUserDeactivation = [
  param("id").isMongoId().withMessage("A valid user ID is required."),
  validateRequest,
];

module.exports = {
  validateInternalDoctorUserCreation,
  validateUserResolution,
  validateInternalUserProfileUpdate,
  validateInternalUserDeactivation,
};
