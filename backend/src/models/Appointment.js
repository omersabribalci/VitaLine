const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
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

AppointmentSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

AppointmentSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

AppointmentSchema.pre("findOneAndUpdate", function () {
  this.where({ isDeleted: false });
});

AppointmentSchema.pre("findOneAndDelete", function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
