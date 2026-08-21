const { body } = require("express-validator");
const validate = require("../middleware/validate");

const update = [
  body("accountStatus")
    .notEmpty()
    .withMessage("Account status is required!")
    .isIn(["enabled", "disabled"])
    .withMessage("Account status must be enabled or disabled!"),
  validate,
];

module.exports = { update };
