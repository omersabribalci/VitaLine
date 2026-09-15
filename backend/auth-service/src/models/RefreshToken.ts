const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  tokenHash: { type: String, required: true, unique: true },
  jti: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  replacedBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema,
);

module.exports = RefreshToken;
