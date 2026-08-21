const { body } = require("express-validator");
const validate = require("../middleware/validate");

const register = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required!")
    .isLength({ min: 3, max: 30 })
    .withMessage("Name should be 3-30 characters!"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Please fill a valid email address!")
    .isLength({ max: 255 })
    .withMessage("Email can be max 255 characters!"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required!")
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number should be 11 characters!")
    .isNumeric()
    .withMessage("Phone number must contain only numbers!"),

  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8-20 characters!")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage("Password must contain upper, lower, and number!"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8-20 characters!")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match!");
      }
      return true;
    }),

  validate,
];

const login = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Please fill a valid email address!")
    .isLength({ max: 255 })
    .withMessage("Email can be max 255 characters!"),

  body("password")
    .notEmpty()
    .withMessage("Password is required!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8-20 characters!")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage("Password must contain upper, lower, and number!"),

  validate,
];

module.exports = {
  register,
  login,
};
