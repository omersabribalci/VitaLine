const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minLength: [3, "Name must be at least 3 character."],
      maxLength: [30, "Name can be maximum 30 character."],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      lowercase: true,
      trim: true,
      maxLength: [255, "Email can be max 255 character"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      match: [
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
        "Password must contain upper, lower, and number",
      ],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: [true, "Role is required."],
    },
    phone: {
      type: String,
      trim: true,
      minLength: [11, "Phone number should be 11 character!"],
      maxLength: [11, "Phone number should be 11 character!"],
      required: [true, "Phone number is required."],
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// --- INDEKSLER ---

// Sadece aktif (silinmemiş) kullanıcılar arasında e-posta benzersiz olsun.
// Böylece silinen bir e-posta adresiyle tekrar kayıt olunabilir.
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

// document middleware, password hashleme user.create/update'den önce

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  //const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, 10);
});

// --- QUERY MIDDLEWARES (SOFT DELETE) ---

const filterDeleted = function () {
  this.where({ isDeleted: false });
};

UserSchema.pre("find", filterDeleted);
UserSchema.pre("findOne", filterDeleted);
UserSchema.pre("findOneAndUpdate", filterDeleted);
UserSchema.pre("findOneAndDelete", filterDeleted);
UserSchema.pre("countDocuments", filterDeleted);

UserSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

module.exports = mongoose.model("User", UserSchema);
