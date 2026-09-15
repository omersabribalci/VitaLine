const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    // userId Auth Service'e aittir; Patient Service'te sadece ID saklanır.
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    accountStatus: {
      type: String,
      enum: ["enabled", "disabled"],
      default: "enabled",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
