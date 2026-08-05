const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountStatus: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", PatientSchema);
