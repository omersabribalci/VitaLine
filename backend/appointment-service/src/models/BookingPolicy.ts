const mongoose = require("mongoose");

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const BookingPolicySchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      enum: ["default"],
      default: "default",
      unique: true,
      immutable: true,
    },
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
      match: [timePattern, "Working time start must be in HH:mm format."],
    },
    workingTimeEnd: {
      type: String,
      default: "16:00",
      match: [timePattern, "Working time end must be in HH:mm format."],
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5],
      validate: {
        validator: (days: number[]) =>
          days.length > 0 &&
          days.every(
            (day) => Number.isInteger(day) && day >= 0 && day <= 6,
          ) &&
          new Set(days).size === days.length,
        message: "Working days must be unique numbers between 0 and 6.",
      },
    },
    lunchBreakStart: {
      type: String,
      default: "12:00",
      match: [timePattern, "Lunch break start must be in HH:mm format."],
    },
    lunchBreakEnd: {
      type: String,
      default: "13:30",
      match: [timePattern, "Lunch break end must be in HH:mm format."],
    },
  },
  { timestamps: true },
);

BookingPolicySchema.pre("validate", function (this: any) {
  if (this.workingTimeStart >= this.workingTimeEnd) {
    this.invalidate(
      "workingTimeEnd",
      "Working end time must be later than working start time.",
    );
  }
  const oneLunchBoundaryMissing =
    (this.lunchBreakStart === null) !== (this.lunchBreakEnd === null);
  if (oneLunchBoundaryMissing) {
    this.invalidate(
      "lunchBreakStart",
      "Lunch break start and end must both be provided or both be null.",
    );
    return;
  }
  if (
    this.lunchBreakStart !== null &&
    this.lunchBreakEnd !== null &&
    this.lunchBreakStart >= this.lunchBreakEnd
  ) {
    this.invalidate(
      "lunchBreakEnd",
      "Lunch break end time must be later than lunch break start time.",
    );
  }
  if (
    this.lunchBreakStart !== null &&
    this.lunchBreakEnd !== null &&
    this.lunchBreakStart < this.workingTimeStart ||
    (this.lunchBreakStart !== null &&
      this.lunchBreakEnd !== null &&
      this.lunchBreakEnd > this.workingTimeEnd)
  ) {
    this.invalidate(
      "lunchBreakStart",
      "Lunch break must be inside working hours.",
    );
  }
});

BookingPolicySchema.statics.getPolicy = async function (this: any) {
  return this.findOneAndUpdate(
    { singletonKey: "default" },
    { $setOnInsert: { singletonKey: "default" } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );
};

const BookingPolicy = mongoose.model("BookingPolicy", BookingPolicySchema);

module.exports = BookingPolicy;
