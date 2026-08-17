const AppError = require("../utils/AppError");

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Not authorized!", 403));
    }

    next();
  };
};

module.exports = checkRole;
