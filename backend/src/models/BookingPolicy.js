const mongoose = require("mongoose");

const BookingPolicySchema = new mongoose.Schema(
  {
    appointmentDurationMinutes: {
      type: Number,
      default: 30,
      min: [5, "Appointment duration must be at least 5 minutes."],
      max: [60, "Appointment duration cannot exceed 60 minutes."],
    },
    bookingWindowDays: {
      type: Number,
      default: 30,
      min: [1, "Booking window must be at least 1 day."],
      max: [365, "Booking window cannot exceed 365 days."],
    },
    workingTimeStart: {
      type: String,
      default: "09:00",
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Working time start must be in HH:mm format.",
      ],
    },
    workingTimeEnd: {
      type: String,
      default: "16:00",
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Working time end hour must be in HH:mm format.",
      ],
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // 0=Sunday, 6=Saturday
      validate: {
        validator: (days) =>
          days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6),
        message:
          "Work days must be numbers between 0 (Sunday) and 6 (Saturday).",
      },
    },
    lunchBreakStart: {
      type: String,
      default: "12:00",
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Lunch break start must be in HH:mm format.",
      ],
    },
    lunchBreakEnd: {
      type: String,
      default: "13:30",
      match: [
        /^([01]\d|2[0-3]):[0-5]\d$/,
        "Lunch break end must be in HH:mm format.",
      ],
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
