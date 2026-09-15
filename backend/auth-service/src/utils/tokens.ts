const crypto = require("node:crypto");
type JwtPayload = import("jsonwebtoken").JwtPayload;
const jwt = require("jsonwebtoken");
type MongooseObjectId = InstanceType<(typeof import("mongoose"))["Types"]["ObjectId"]>;
type UserRole = "admin" | "doctor" | "patient";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

type TokenUser = {
  _id: MongooseObjectId;
  email: string;
  role: UserRole;
};

interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

interface RefreshTokenPayload extends JwtPayload {
  id: string;
  jti: string;
}

const isUserRole = (value: unknown): value is UserRole =>
  value === "admin" || value === "doctor" || value === "patient";

const isJwtPayload = (value: string | JwtPayload): value is JwtPayload =>
  typeof value !== "string";

const hashToken = (token: string): string =>
  // Ham refresh token DB'ye yazılmaz; ele geçirilme riskini azaltmak için özeti saklanır.
  crypto.createHash("sha256").update(token).digest("hex");

// JTI, her refresh token'a ait benzersiz kimliktir.
const createJti = (): string => crypto.randomBytes(16).toString("hex");

// Access token kısa ömürlüdür ve frontend tarafından Authorization header'ında gönderilir.
const signAccessToken = (user: TokenUser, secret: string): string =>
  jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: ACCESS_TOKEN_TTL },
  );

// Refresh token daha uzun ömürlüdür; kullanıcı ve JTI bilgisini taşır.
const signRefreshToken = (
  user: TokenUser,
  jti: string,
  secret: string,
): string =>
  jwt.sign({ id: user._id.toString(), jti }, secret, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });

const verifyAccessToken = (
  token: string,
  secret: string,
): AccessTokenPayload => {
  const decoded = jwt.verify(token, secret);

  if (
    !isJwtPayload(decoded) ||
    typeof decoded.id !== "string" ||
    typeof decoded.email !== "string" ||
    !isUserRole(decoded.role)
  ) {
    throw new Error("Invalid access token payload.");
  }

  return decoded as AccessTokenPayload;
};

const verifyRefreshToken = (
  token: string,
  secret: string,
): RefreshTokenPayload => {
  // İmzanın doğru ve 7 günlük sürenin dolmamış olduğunu doğrular.
  const decoded = jwt.verify(token, secret);

  if (
    !isJwtPayload(decoded) ||
    typeof decoded.id !== "string" ||
    typeof decoded.jti !== "string"
  ) {
    throw new Error("Invalid refresh token payload.");
  }

  return decoded as RefreshTokenPayload;
};

module.exports = {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_SECONDS,
  hashToken,
  createJti,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
