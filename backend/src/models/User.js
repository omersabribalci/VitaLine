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
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
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
      required: [true, "Phone number is required."],
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

// document middleware, password hashleme user.create/update'den önce

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  //const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, 10);
});

// Deleted olanları gösterme/yok say, middleware

UserSchema.pre("find", function () {
  this.where({ isDeleted: false });
});

UserSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

UserSchema.pre("findOneAndUpdate", function () {
  this.where({ isDeleted: false });
});

UserSchema.pre("findOneAndDelete", function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("User", UserSchema);
