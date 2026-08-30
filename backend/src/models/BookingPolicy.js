const mongoose = require("mongoose");

const BookingPolicySchema = new mongoose.Schema(
  {
    slotDurationMinutes: {
      type: Number,
      default: 15,
      min: [5, "Slot duration must be at least 5 minutes."],
      max: [120, "Slot duration cannot exceed 120 minutes."],
    },
    bookingWindowDays: {
      type: Number,
      default: 30,
      min: [1, "Booking window must be at least 1 day."],
      max: [365, "Booking window cannot exceed 365 days."],
    },
    defaultStartHour: {
      type: String,
      default: "09:00",
      match: [/^\d{2}:\d{2}$/, "Start hour must be in HH:mm format."],
    },
    defaultEndHour: {
      type: String,
      default: "17:00",
      match: [/^\d{2}:\d{2}$/, "End hour must be in HH:mm format."],
    },
    defaultWorkDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // 0=Sunday, 6=Saturday
      validate: {
        validator: (days) =>
          days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message: "Work days must be integers between 0 (Sunday) and 6 (Saturday).",
      },
    },
    lunchBreakStart: {
      type: String,
      default: null,
      match: [/^\d{2}:\d{2}$/, "Lunch break start must be in HH:mm format."],
    },
    lunchBreakEnd: {
      type: String,
      default: null,
      match: [/^\d{2}:\d{2}$/, "Lunch break end must be in HH:mm format."],
    },
  },
  { timestamps: true },
);

// Singleton helper: always get-or-create the single policy document
BookingPolicySchema.statics.getPolicy = async function () {
  let policy = await this.findOne();
  if (!policy) {
    policy = await this.create({});
  }
  return policy;
};

module.exports = mongoose.model("BookingPolicy", BookingPolicySchema);
