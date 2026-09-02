const { validationResult } = require("express-validator");
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((error) => ({
      field: error.path || error.param || error.location,
      message:
        error.msg instanceof Error ? error.msg.message : String(error.msg),
    }));

    return res.status(400).json({
      success: false,
      message: details[0]?.message || "Validation failed.",
      errors: details,
    });
  }
  next();
};
module.exports = validate;
