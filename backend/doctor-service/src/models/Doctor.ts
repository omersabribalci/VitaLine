const mongoose = require("mongoose");
const {
  doctorTitles,
  doctorSpecialities,
} = require("../config/doctorCatalog.js");

const dateRangeSchema = new mongoose.Schema(
  {
    start: { type: Date, required: true },
    end: {
      type: Date,
      required: true,
      validate: {
        validator(this: { start: Date }, value: Date) {
          return value > this.start;
        },
        message: "End date must be later than start date.",
      },
    },
  },
  { _id: false },
);

const doctorSchema = new mongoose.Schema(
  {
    // This ID is owned by Auth Service; it is deliberately not a Mongoose ref.
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    title: {
      type: String,
      enum: doctorTitles,
      required: true,
      trim: true,
    },
    speciality: {
      type: String,
      enum: doctorSpecialities,
      required: true,
      trim: true,
      index: true,
    },
    unavailableDates: { type: [dateRangeSchema], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

const filterDeleted = function (this: { where(filter: object): void }) {
  this.where({ isDeleted: false });
};

doctorSchema.pre("find", filterDeleted);
doctorSchema.pre("findOne", filterDeleted);
doctorSchema.pre("findOneAndUpdate", filterDeleted);
doctorSchema.pre("findOneAndDelete", filterDeleted);
doctorSchema.pre("countDocuments", filterDeleted);
doctorSchema.pre("aggregate", function (this: { pipeline(): object[] }) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
