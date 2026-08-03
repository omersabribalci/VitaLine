const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", UserSchema);
