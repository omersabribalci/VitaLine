const BookingPolicy = require("../models/BookingPolicy");
const AppError = require("../utils/AppError");
const sendSuccessResponse = require("../utils/sendSuccessResponse");

/**
 * GET /api/booking-policy
 * Herkese açık — frontend de policy'yi okuyabilmeli (maxDate vs. için)
 */
const getPolicy = async (req, res, next) => {
  try {
    const policy = await BookingPolicy.getPolicy();
    return sendSuccessResponse(res, 200, policy);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/booking-policy
 * Sadece admin erişebilir
 */
const updatePolicy = async (req, res, next) => {
  try {
    const allowedFields = [
      "slotDurationMinutes",
      "bookingWindowDays",
      "defaultStartHour",
      "defaultEndHour",
      "defaultWorkDays",
      "lunchBreakStart",
      "lunchBreakEnd",
    ];

    // Sadece izin verilen alanları al
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return next(new AppError("No valid fields provided to update.", 400));
    }

    // Mevcut policy'yi güncelle (yoksa yarat)
    let policy = await BookingPolicy.findOne();
    if (!policy) {
      policy = await BookingPolicy.create(updates);
    } else {
      Object.assign(policy, updates);
      await policy.save({ runValidators: true });
    }

    return sendSuccessResponse(res, 200, policy, "Booking policy updated successfully!");
  } catch (error) {
    next(error);
  }
};

module.exports = { getPolicy, updatePolicy };
