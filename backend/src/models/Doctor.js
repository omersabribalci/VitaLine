const mongoose = require("mongoose");
const DateRangeSchema = require("./DateRange");

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
      type: [DateRangeSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Deleted olanları gösterme/yok say, middleware

DoctorSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

DoctorSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

DoctorSchema.pre("findOneAndUpdate", function () {
  this.where({ isDeleted: false });
});

DoctorSchema.pre("findOneAndDelete", function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("Doctor", DoctorSchema);
