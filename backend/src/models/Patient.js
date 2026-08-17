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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Deleted olanları gösterme/yok say, middleware

PatientSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

PatientSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

PatientSchema.pre("findOneAndUpdate", function () {
  this.where({ isDeleted: false });
});

PatientSchema.pre("findOneAndDelete", function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("Patient", PatientSchema);
