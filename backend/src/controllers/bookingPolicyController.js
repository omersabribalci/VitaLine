const BookingPolicy = require("../models/BookingPolicy");
const AppError = require("../utils/AppError");
const sendSuccessResponse = require("../utils/sendSuccessResponse");

const getPolicy = async (req, res, next) => {
  try {
    const policy = await BookingPolicy.getPolicy();
    return sendSuccessResponse(res, 200, policy);
  } catch (error) {
    next(error);
  }
};

const updatePolicy = async (req, res, next) => {
  try {
    const allowedFields = [
      "appointmentDurationMinutes",
      "bookingWindowDays",
      "workingTimeStart",
      "workingTimeEnd",
      "workingDays",
      "lunchBreakStart",
      "lunchBreakEnd",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError("No valid fields provided to update.", 400));
    }

    const policy = await BookingPolicy.getPolicy();

    Object.assign(policy, updates);

    await policy.save({ runValidators: true });

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

module.exports = { getPolicy, updatePolicy };
