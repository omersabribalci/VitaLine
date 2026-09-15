const { param } = require("express-validator");
const { validateRequest } = require("../middleware/validateRequest.js");

const validateOwnerCancellation = [
  param("ownerId").isMongoId().withMessage("A valid owner ID is required."),
  validateRequest,
];

module.exports = { validateOwnerCancellation };
