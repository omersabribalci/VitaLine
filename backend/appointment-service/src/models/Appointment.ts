const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    // These are foreign service IDs, not Mongoose refs. Appointment Service
    // deliberately cannot populate collections owned by Doctor/Patient Service.
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    dateAndTime: {
      type: Date,
      required: [true, "Date and time is required."],
    },
    bookingDateKey: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
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

const activeScheduled = {
  partialFilterExpression: { status: "scheduled", isDeleted: false },
};

// The checks in application code produce friendly error messages. These unique
// indexes are the final guard against two simultaneous requests booking one slot.
AppointmentSchema.index(
  { doctorId: 1, dateAndTime: 1 },
  { unique: true, name: "one_active_appointment_per_doctor_slot", ...activeScheduled },
);
AppointmentSchema.index(
  { patientId: 1, doctorId: 1, bookingDateKey: 1 },
  {
    unique: true,
    name: "one_active_appointment_per_patient_doctor_day",
    ...activeScheduled,
  },
);
AppointmentSchema.index(
  { patientId: 1, dateAndTime: 1 },
  { unique: true, name: "one_active_appointment_per_patient_slot", ...activeScheduled },
);

const filterDeleted = function (this: any) {
  this.where({ isDeleted: false });
};

AppointmentSchema.pre("find", filterDeleted);
AppointmentSchema.pre("findOne", filterDeleted);
AppointmentSchema.pre("findOneAndUpdate", filterDeleted);
AppointmentSchema.pre("findOneAndDelete", filterDeleted);
AppointmentSchema.pre("countDocuments", filterDeleted);

AppointmentSchema.pre("aggregate", function (this: any) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

const Appointment = mongoose.model(
  "Appointment",
  AppointmentSchema,
);

module.exports = Appointment;
