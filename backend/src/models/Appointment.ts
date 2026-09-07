import mongoose, { type Aggregate, type Query } from "mongoose";
import type { AppointmentDocumentShape } from "../types";

const AppointmentSchema = new mongoose.Schema<AppointmentDocumentShape>(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    dateAndTime: {
      type: Date,
      required: [true, "Date and time is required."],
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Deleted olanları gösterme/yok say, middleware

const filterDeleted = function (this: Query<unknown, AppointmentDocumentShape>) {
  this.where({ isDeleted: false });
};

AppointmentSchema.pre("find", filterDeleted);
AppointmentSchema.pre("findOne", filterDeleted);
AppointmentSchema.pre("findOneAndUpdate", filterDeleted);
AppointmentSchema.pre("findOneAndDelete", filterDeleted);
AppointmentSchema.pre("countDocuments", filterDeleted);

AppointmentSchema.pre("aggregate", function (this: Aggregate<unknown[]>) {
  // Aggregation pipeline'ının en başına { $match: { isDeleted: false } } ekler
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

export = mongoose.model<AppointmentDocumentShape>("Appointment", AppointmentSchema);
