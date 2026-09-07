import BookingPolicy = require("../models/BookingPolicy");
import AppError = require("../utils/AppError");
import sendSuccessResponse = require("../utils/sendSuccessResponse");
import { startAppointmentStatusJob } from "../jobs/appointmentStatusJob";
import type { NextFunction, Response } from "express";
import type { AppRequest } from "../types";
import type { UpdateBookingPolicyBody } from "../types/requests";

const getPolicy = async (_req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const policy = await BookingPolicy.getPolicy();
    return sendSuccessResponse(res, 200, policy);
  } catch (error) {
    next(error);
  }
};

const updatePolicy = async (
  req: AppRequest<UpdateBookingPolicyBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const allowedFields = [
      "appointmentDurationMinutes",
      "bookingWindowDays",
      "workingTimeStart",
      "workingTimeEnd",
      "workingDays",
      "lunchBreakStart",
      "lunchBreakEnd",
    ] as const satisfies ReadonlyArray<keyof UpdateBookingPolicyBody>;

    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]]),
    ) as UpdateBookingPolicyBody;

    if (Object.keys(updates).length === 0) {
      return next(new AppError("No valid fields provided to update.", 400));
    }

    const policy = await BookingPolicy.getPolicy();

    Object.assign(policy, updates);

    // Document.save() validates by default; runValidators belongs to update queries.
    await policy.save();
    // randevu süresi değiştiği an arka plan görevini de anında günceller. Böylece sistem dinamik olarak yeni ayarlara uyum sağlar.
    await startAppointmentStatusJob();

    return sendSuccessResponse(
      res,
      200,
      policy,
      "Booking policy updated successfully!",
    );
  } catch (error) {
    next(error);
  }
};

export { getPolicy, updatePolicy };
