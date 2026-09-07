import crypto from "node:crypto";
import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";
import type { UserRole } from "../types";
import RefreshToken = require("../models/RefreshToken");
import { getRequiredEnv } from "../config/env";

const ACCESS_TTL = "15m";
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;
const REFRESH_GRACE_MS = 10 * 1000;

interface TokenUser {
  _id: Types.ObjectId;
  email: string;
  role: UserRole;
}

interface PersistRefreshTokenInput {
  user: TokenUser;
  refreshToken: string;
  jti: string;
  ip?: string;
  userAgent: string;
}

interface MutableRefreshToken {
  revokedAt: Date | null;
  replacedBy: string | null;
  save(): Promise<unknown>;
}

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
  crypto.createHash("sha256").update(token).digest("hex");

const createJti = (): string => crypto.randomBytes(16).toString("hex");

const signAccessToken = (user: TokenUser): string =>
  jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    getRequiredEnv("ACCESS_TOKEN_SECRET"),
    { expiresIn: ACCESS_TTL },
  );

const signRefreshToken = (user: TokenUser, jti: string): string =>
  jwt.sign(
    { id: user._id.toString(), jti },
    getRequiredEnv("REFRESH_TOKEN_SECRET"),
    { expiresIn: REFRESH_TTL_SEC },
  );

const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, getRequiredEnv("ACCESS_TOKEN_SECRET"));

  if (
    !isJwtPayload(decoded) ||
    typeof decoded.id !== "string" ||
    typeof decoded.email !== "string" ||
    !isUserRole(decoded.role)
  ) {
    throw new Error("Invalid access token payload");
  }

  return decoded as AccessTokenPayload;
};

const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, getRequiredEnv("REFRESH_TOKEN_SECRET"));

  if (
    !isJwtPayload(decoded) ||
    typeof decoded.id !== "string" ||
    typeof decoded.jti !== "string"
  ) {
    throw new Error("Invalid refresh token payload");
  }

  return decoded as RefreshTokenPayload;
};

const persistRefreshToken = async ({
  user,
  refreshToken,
  jti,
  ip,
  userAgent,
}: PersistRefreshTokenInput): Promise<void> => {
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    jti,
    expiresAt: new Date(Date.now() + REFRESH_TTL_SEC * 1000),
    ip,
    userAgent,
  });
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth",
    maxAge: REFRESH_TTL_SEC * 1000,
  });
};

const rotateRefreshToken = async (
  oldDoc: MutableRefreshToken,
  user: TokenUser,
  req: Request,
  res: Response,
): Promise<{ accessToken: string }> => {
  oldDoc.revokedAt = new Date();
  const newJti = createJti();
  oldDoc.replacedBy = newJti;
  await oldDoc.save();

  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user, newJti);
  await persistRefreshToken({
    user,
    refreshToken: newRefresh,
    jti: newJti,
    ip: req.ip,
    userAgent: req.headers["user-agent"] ?? "",
  });
  setRefreshCookie(res, newRefresh);
  return { accessToken: newAccess };
};

export {
  REFRESH_GRACE_MS,
  createJti,
  hashToken,
  persistRefreshToken,
  rotateRefreshToken,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
