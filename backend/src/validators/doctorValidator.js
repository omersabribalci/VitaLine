const { body } = require("express-validator");
const validate = require("../middleware/validate");
const AppError = require("../utils/AppError");

const titles = [
  "Dr.",
  "Ast. Dr.",
  "Uzm. Dr.",
  "Op. Dr.",
  "Doç. Dr.",
  "Prof. Dr.",
];

const requiredUserFields = [
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
];

const password = body("password")
  .notEmpty()
  .withMessage("Password is required!")
  .isLength({ min: 8, max: 20 })
  .withMessage("Password must be 8-20 characters!")
  .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
  .withMessage("Password must contain upper, lower, and number!");

const optionalUserFields = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Name should be 3-30 characters!"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please fill a valid email address!")
    .isLength({ max: 255 })
    .withMessage("Email can be max 255 characters!"),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage("Phone number should be 11 characters!")
    .isNumeric()
    .withMessage("Phone number must contain only numbers!"),
];

const doctorFields = (optional = false) => [
  body("title")
    .optional({ values: "undefined" })
    .trim()
    .isIn(titles)
    .withMessage("Please select a valid title!"),

  body("image")
    .optional({ values: "undefined" })
    .trim()
    .notEmpty()
    .withMessage("Image is required!"),

  body("speciality")
    .optional({ values: "undefined" })
    .trim()
    .notEmpty()
    .withMessage("Speciality is required!"),

  body("unavailableDates")
    .optional({ values: "undefined" })
    .isArray()
    .withMessage("Unavailable dates must be an array!")
    .custom((ranges) => {
      for (const range of ranges) {
        if (
          range.start &&
          range.end &&
          new Date(range.end) <= new Date(range.start)
        ) {
          throw new AppError("End date must be later than start date!", 400);
        }
      }
      return true;
    }),

  body("unavailableDates.*.start")
    .isISO8601()
    .withMessage("Start date must be a valid date!"),

  body("unavailableDates.*.end")
    .isISO8601()
    .withMessage("End date must be a valid date!"),
];

const create = [
  ...requiredUserFields,
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required!")
    .isIn(titles)
    .withMessage("Please select a valid title!"),
  body("image").trim().notEmpty().withMessage("Image is required!"),
  body("speciality").trim().notEmpty().withMessage("Speciality is required!"),
  password,
  ...doctorFields(),
  validate,
];

const update = [
  ...optionalUserFields,
  body("password")
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8-20 characters!")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    .withMessage("Password must contain upper, lower, and number!"),
  ...doctorFields(true),
  validate,
];

module.exports = { create, update };
