type JwtPayload = import("jsonwebtoken").JwtPayload;
const jwt = require("jsonwebtoken");
type UserRole = "admin" | "doctor" | "patient";

interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

const isUserRole = (value: unknown): value is UserRole =>
  value === "admin" || value === "doctor" || value === "patient";

const verifyAccessToken = (
  token: string,
  secret: string,
): AccessTokenPayload => {
  const decoded = jwt.verify(token, secret);
  if (
    typeof decoded === "string" ||
    typeof decoded.id !== "string" ||
    typeof decoded.email !== "string" ||
    !isUserRole(decoded.role)
  ) {
    throw new Error("Invalid access token payload.");
  }
  return decoded as AccessTokenPayload;
};

module.exports = { verifyAccessToken };
