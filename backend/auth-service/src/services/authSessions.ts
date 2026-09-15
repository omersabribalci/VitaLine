const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const patientClient = require("../clients/patientClient.js");
const RefreshToken = require("../models/RefreshToken.js");
const User = require("../models/User.js");
const {
  createJti,
  hashToken,
  REFRESH_TOKEN_TTL_SECONDS,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokens.js");

type RequestContext = {
  requestId: string;
  ip?: string;
  userAgent?: string;
};

class AuthSessionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ConcurrentRefreshError extends Error {}

const toSessionUser = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  phone: string;
  image: string;
  role: "admin" | "doctor" | "patient";
}) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone,
  image: user.image || "",
  role: user.role,
});

const assertPatientCanLogin = async (
  user: {
    _id: { toString(): string };
    role: "admin" | "doctor" | "patient";
  },
  requestId: string,
) => {
  if (user.role !== "patient") return;

  try {
    const patient = await patientClient.getPatientByUserId(
      user._id.toString(),
      requestId,
    );

    if (!patient) throw new AuthSessionError("Patient profile not found.", 403);
    if (patient.accountStatus === "disabled") {
      throw new AuthSessionError("Account is disabled", 403);
    }
  } catch (error) {
    if (error instanceof AuthSessionError) throw error;
    if (error instanceof patientClient.PatientServiceError) {
      throw new AuthSessionError(
        "Patient Service is temporarily unavailable.",
        503,
      );
    }
    throw error;
  }
};

const login = async (
  input: { email: string; password: string },
  context: RequestContext,
) => {
  const user = await User.findOne({ email: input.email.toLowerCase() })
    .select("+password")
    .lean();

  if (!user || !(await bcrypt.compare(input.password, user.password))) {
    throw new AuthSessionError("Invalid credentials", 400);
  }
  if (user.registrationStatus !== "active") {
    throw new AuthSessionError("Account registration is not complete.", 403);
  }

  await assertPatientCanLogin(user, context.requestId);

  const jti = createJti();
  // Login sonunda kısa ömürlü access token ve uzun ömürlü refresh token üretilir.
  const accessToken = signAccessToken(
    user,
    process.env.ACCESS_TOKEN_SECRET || "",
  );
  const refreshToken = signRefreshToken(
    user,
    jti,
    process.env.REFRESH_TOKEN_SECRET || "",
  );

  await RefreshToken.create({
    user: user._id,
    // Güvenlik için refresh token'ın kendisi değil SHA-256 özeti saklanır.
    tokenHash: hashToken(refreshToken),
    jti,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1_000),
    ip: context.ip,
    userAgent: context.userAgent || "",
  });

  return { accessToken, refreshToken, user: toSessionUser(user) };
};

const refresh = async (rawToken: string, context: RequestContext) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(
      rawToken,
      process.env.REFRESH_TOKEN_SECRET || "",
    );
  } catch {
    throw new AuthSessionError("Invalid or expired refresh token", 401);
  }

  // Cookie'den gelen token'ın özeti ve JTI değeri DB kaydıyla eşleştirilir.
  const storedToken = await RefreshToken.findOne({
    tokenHash: hashToken(rawToken),
    jti: decoded.jti,
  }).lean();

  if (!storedToken) {
    throw new AuthSessionError("Refresh token not recognized", 401);
  }
  if (storedToken.revokedAt) {
    // İptal edilmiş token tekrar kullanılırsa olası çalınma kabul edilir
    // ve kullanıcının açık olan bütün refresh oturumları kapatılır.
    await RefreshToken.updateMany(
      { user: decoded.id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    throw new AuthSessionError(
      "Token reuse detected. All sessions were terminated.",
      401,
    );
  }
  if (storedToken.expiresAt < new Date()) {
    throw new AuthSessionError("Refresh token expired", 401);
  }

  const user = await User.findById(decoded.id).lean();
  if (!user || user.registrationStatus !== "active") {
    throw new AuthSessionError("User account is not active.", 401);
  }

  await assertPatientCanLogin(user, context.requestId);

  const newJti = createJti();
  const accessToken = signAccessToken(
    user,
    process.env.ACCESS_TOKEN_SECRET || "",
  );
  const refreshToken = signRefreshToken(
    user,
    newJti,
    process.env.REFRESH_TOKEN_SECRET || "",
  );
  const dbSession = await mongoose.startSession();

  try {
    // Rotation tek transaction'dır: eski token iptal edilirken yenisi kaydedilir.
    // İki işlemden biri başarısız olursa MongoDB ikisini de geri alır.
    await dbSession.withTransaction(async () => {
      const updateResult = await RefreshToken.updateOne(
        { _id: storedToken._id, revokedAt: null },
        { $set: { revokedAt: new Date(), replacedBy: newJti } },
        { session: dbSession },
      );

      if (updateResult.modifiedCount !== 1) {
        throw new ConcurrentRefreshError();
      }

      await RefreshToken.create(
        [
          {
            user: user._id,
            tokenHash: hashToken(refreshToken),
            jti: newJti,
            expiresAt: new Date(
              Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1_000,
            ),
            ip: context.ip,
            userAgent: context.userAgent || "",
          },
        ],
        { session: dbSession },
      );
    });
  } catch (error) {
    if (error instanceof ConcurrentRefreshError) {
      await RefreshToken.updateMany(
        { user: user._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      throw new AuthSessionError(
        "Token reuse detected. All sessions were terminated.",
        401,
      );
    }
    throw error;
  } finally {
    await dbSession.endSession();
  }

  return { accessToken, refreshToken, user: toSessionUser(user) };
};

const logout = async (rawToken?: string) => {
  if (!rawToken) return;

  await RefreshToken.updateOne(
    { tokenHash: hashToken(rawToken), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
};

module.exports = { AuthSessionError, login, refresh, logout };
