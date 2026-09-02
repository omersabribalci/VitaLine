const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const ACCESS_TTL = "10s";
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7; // 7 days
const REFRESH_GRACE_MS = 10 * 1000; // 10 saniye tolerans

// Node.js'in yerleşik crypto modülünü kullanarak token string'ini tek yönlü (SHA-256) hash'e çevirir.
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// 16 baytlık rastgele güvenli veri üretip bunu 32 karakterlik hex string'e dönüştürür
function createJti() {
  return crypto.randomBytes(16).toString("hex");
}

// Kullanıcının id ve email bilgisini alır, gizli anahtar (ACCESS_TOKEN_SECRET) ile imzalar. Ömrü 15 dakikadır.
function signAccessToken(user) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TTL,
  });
  return token;
}

// Kullanıcının id ve benzersiz jti bilgisini alır, ayrı bir gizli anahtar (REFRESH_TOKEN_SECRET) ile imzalar. Ömrü 7 gündür.
function signRefreshToken(user, jti) {
  const payload = { id: user._id.toString(), jti };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TTL_SEC,
  });
  return token;
}

// İmzalanmış refresh token'ı hash'ler ve veritabanına yeni bir RefreshToken dokümanı olarak kaydeder.
async function persistRefreshToken({ user, refreshToken, jti, ip, userAgent }) {
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    jti,
    expiresAt,
    ip,
    userAgent,
  });
}

// Token'ı tarayıcıya yollar
// httpOnly: true: JavaScript/XSS erişimini engeller.
// sameSite: "strict": CSRF saldırılarını engeller.
// path: "/api/auth": Cookie'nin yalnızca /api/auth altındaki endpoint'lere (login, refresh, logout) gönderilmesini sağlar.
function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TTL_SEC * 1000,
  });
}

// Token yenileme merkezidir.
// Eski token'ı öldürür (revokedAt = new Date()).
// Eski kayda yeni token'ın izini bırakır (replacedBy = newJti).
// Sıfır bir Access Token ve sıfır bir Refresh Token üretir.
// Yeni Refresh Token'ı DB'ye kaydeder ve yeni cookie'yi istemciye basar.
async function rotateRefreshToken(oldDoc, user, req, res) {
  // revoke old
  oldDoc.revokedAt = new Date();
  const newJti = createJti();
  oldDoc.replacedBy = newJti;
  await oldDoc.save();

  // issue new
  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user, newJti);
  await persistRefreshToken({
    user,
    refreshToken: newRefresh,
    jti: newJti,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
  });
  setRefreshCookie(res, newRefresh);
  return { accessToken: newAccess };
}

module.exports = {
  hashToken,
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  rotateRefreshToken,
  REFRESH_GRACE_MS,
};
