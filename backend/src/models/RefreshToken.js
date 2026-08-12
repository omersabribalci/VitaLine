const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // index-true sorguların hızlı çalışmasını sağlar.
  tokenHash: { type: String, required: true, unique: true }, // Güvenlik gereği token'ın ham hali veritabanına kaydedilmez. SHA-256 algoritmasıyla özetlenmiş hali saklanır. unique: true sayesinde aynı hash iki kez eklenemez.
  jti: { type: String, required: true, index: true }, // Token'a özel üretilen benzersiz kimliktir. Token yenilemelerini ve zayıf bağları takip etmek için kullanılır.
  expiresAt: { type: Date, required: true, index: true },
  revokedAt: { type: Date, default: null }, // Token iptal edildiyse iptal edildiği tarih yazılır. null ise token aktif demektir.
  replacedBy: { type: String, default: null }, // Rotation (yenileme) gerçekleştiğinde, bu token'ın yerine geçen yeni token'ın JTI değeri buraya yazılır.
  createdAt: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

//MongoDB TTL (Time-To-Live) indeksidir. expiresAt tarihi geldiği anda MongoDB bu belgeyi arka planda otomatik olarak veritabanından siler.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
