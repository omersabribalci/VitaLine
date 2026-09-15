type ValidationChain = import("express-validator").ValidationChain;
const { body } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest.js");

const email = () =>
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .isLength({ max: 255 })
    .withMessage("Email can contain at most 255 characters.");

const password = (): ValidationChain =>
  body("password")
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters.")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage("Password must contain upper, lower, and number.");

const validateLogin = [
  email(),
  password(),
  validateRequest,
];

const validateRegistration = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .bail()
    .isLength({ min: 3, max: 30 })
    .withMessage("Name should contain between 3 and 30 characters."),
  email(),
  body("phone")
    .trim()
    .matches(/^\d{11}$/)
    .withMessage("Phone number should contain exactly 11 digits."),
  password(),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .bail()
    .custom((value: string, { req }: { req: { body: { password: string } } }) =>
      value === req.body.password,
    )
    .withMessage("Passwords do not match."),
  body("image").optional().isString().withMessage("Image must be a string."),
  validateRequest,
];

module.exports = { validateLogin, validateRegistration };
