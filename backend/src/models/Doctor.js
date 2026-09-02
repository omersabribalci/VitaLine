const mongoose = require("mongoose");
const DateRangeSchema = require("./DateRange");

const DoctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Bir kullanıcının yalnızca 1 doktor profili olabilir
    },
    title: {
      type: String,
      enum: ["Dr.", "Ast. Dr.", "Uzm. Dr.", "Op. Dr.", "Doç. Dr.", "Prof. Dr."],
      required: [true, "Title is required."],
      trim: true,
    },
    speciality: {
      type: String,
      required: [true, "Speciality is required."],
      trim: true, // Baştaki ve sondaki boşlukları temizler
      index: true, // Branşa göre hızlı arama/filtreleme için
    },
    unavailableDates: {
      type: [DateRangeSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Soft delete filtresini hızlandırır
    },
  },
  { timestamps: true },
);

// --- QUERY MIDDLEWARES (SOFT DELETE) ---

const filterDeleted = function () {
  this.where({ isDeleted: false });
};

DoctorSchema.pre("find", filterDeleted);
DoctorSchema.pre("findOne", filterDeleted);
DoctorSchema.pre("findOneAndUpdate", filterDeleted);
DoctorSchema.pre("findOneAndDelete", filterDeleted);
DoctorSchema.pre("countDocuments", filterDeleted);

DoctorSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

module.exports = mongoose.model("Doctor", DoctorSchema);
