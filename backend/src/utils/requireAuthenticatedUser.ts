import type { Request } from "express";
import type { AuthenticatedUser } from "../types";
import AppError = require("./AppError");

const requireAuthenticatedUser = (req: Request): AuthenticatedUser => {
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  return req.user;
};

export = requireAuthenticatedUser;
