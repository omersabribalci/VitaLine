const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      minlength: 11,
      maxlength: 11,
    },
    image: { type: String, trim: true, default: "" },
    isDeleted: { type: Boolean, default: false },
    registrationStatus: {
      type: String,
      enum: ["pending", "active", "failed"],
      default: "active",
    },
  },
  { timestamps: true },
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

userSchema.pre(
  "save",
  async function (this: any) {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
  },
);

const filterDeleted = function (this: any) {
  this.where({ isDeleted: false });
};

userSchema.pre("find", filterDeleted);
userSchema.pre("findOne", filterDeleted);
userSchema.pre("findOneAndUpdate", filterDeleted);
userSchema.pre("findOneAndDelete", filterDeleted);
userSchema.pre("countDocuments", filterDeleted);
userSchema.pre("aggregate", function (this: any) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
