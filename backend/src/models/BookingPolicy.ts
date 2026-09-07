import mongoose, { type HydratedDocument, type Model } from "mongoose";
import type { BookingPolicyDocumentShape } from "../types";

interface BookingPolicyModel extends Model<BookingPolicyDocumentShape> {
  getPolicy(): Promise<HydratedDocument<BookingPolicyDocumentShape>>;
}

const BookingPolicySchema = new mongoose.Schema<
  BookingPolicyDocumentShape,
  BookingPolicyModel
>(
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
      validate: {
        validator: function (
          this:
            | HydratedDocument<BookingPolicyDocumentShape>
            | mongoose.Query<unknown, BookingPolicyDocumentShape>,
          value: string,
        ): boolean {
          const workingTimeStart =
            this instanceof mongoose.Query
              ? this.get("workingTimeStart")
              : this.workingTimeStart;
          return typeof workingTimeStart === "string" && workingTimeStart < value;
        },
        message: "Working end time must be later than working start time.",
      },
    },
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // 0=Sunday, 6=Saturday
      validate: {
        validator: (days: number[]): boolean =>
          days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
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
      validate: {
        validator: function (
          this:
            | HydratedDocument<BookingPolicyDocumentShape>
            | mongoose.Query<unknown, BookingPolicyDocumentShape>,
          value: string,
        ): boolean {
          if (!value) return true;
          const lunchBreakStart =
            this instanceof mongoose.Query
              ? this.get("lunchBreakStart")
              : this.lunchBreakStart;
          if (typeof lunchBreakStart !== "string") return false;
          return lunchBreakStart < value;
        },
        message:
          "Lunch break end time must be later than lunch break start time.",
      },
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

export = mongoose.model<BookingPolicyDocumentShape, BookingPolicyModel>(
  "BookingPolicy",
  BookingPolicySchema,
);
