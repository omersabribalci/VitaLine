import AppError = require("../utils/AppError");
import User = require("../models/User");
import Patient = require("../models/Patient");
import { verifyAccessToken } from "../utils/tokens";
import type { NextFunction, Request, Response } from "express";

const verifyToken = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization || "";
  const [scheme, tokenFromHeader] = header.split(" ");
  const tokenFromCookie = req.cookies?.access_token;

  const token =
    scheme === "Bearer" && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    const msg =
      error instanceof Error && error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid token";
    return next(new AppError(msg, 401));
  }

  try {
    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).lean();

    if (!user) {
      return next(new AppError("User session is no longer valid.", 401));
    }

    if (user.role !== decoded.role) {
      return next(new AppError("User role is no longer valid.", 401));
    }

    if (user.role === "patient") {
      const patient = await Patient.findOne({ userId: user._id }).lean();

      if (!patient) {
        return next(new AppError("Patient profile not found.", 401));
      }

      if (patient.accountStatus === "disabled") {
        return next(new AppError("Account is disabled.", 403));
      }
    }

    req.user = { id: user._id.toString(), email: user.email, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};

export = verifyToken;
