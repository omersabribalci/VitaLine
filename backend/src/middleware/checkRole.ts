const AppError = require("../utils/AppError");
import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types";

const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Not authorized!", 403));
    }

    next();
  };
};

export = checkRole;
