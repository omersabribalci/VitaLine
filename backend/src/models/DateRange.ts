import mongoose from "mongoose";
import type { DateRangeValue } from "../types";

const DateRangeSchema = new mongoose.Schema<DateRangeValue>(
  {
    start: { type: Date, required: true },
    end: {
      type: Date,
      required: true,
      validate: {
        validator: function (
          this:
            | mongoose.HydratedDocument<DateRangeValue>
            | mongoose.Query<unknown, DateRangeValue>,
          value: Date,
        ): boolean {
          const start =
            this instanceof mongoose.Query ? this.get("start") : this.start;
          return start instanceof Date && start <= value;
        },
        message: "End date must be equal to or after start date.",
      },
    },
  },
  { _id: false },
);

export = DateRangeSchema;
