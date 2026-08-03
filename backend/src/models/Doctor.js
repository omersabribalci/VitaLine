const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      enum: ["Dr.", "Ast. Dr.", "Uzm. Dr.", "Op. Dr.", "Doç. Dr.", "Prof. Dr."],
      required: [true, "Title is required."],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required."],
    },
    speciality: {
      type: String,
      required: [true, "Speciality is required."],
    },
    unavailableDates: {
      type: [Date],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Doctor", DoctorSchema);
