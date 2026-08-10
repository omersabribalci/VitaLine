"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Patient = require("../models/Patient");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const AppError = require("../utils/AppError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshCookie,
  hashToken,
  rotateRefreshToken,
} = require("../utils/tokens");
const refreshToken = require("../models/RefreshToken");

const registerPatient = async (req, res, next) => {
  // TODO validation

  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError("Passwords do not match!", 400));
  }

  const session = await mongoose.startSession();

  let userWithoutPassword;
  let patient;

  try {
    await session.withTransaction(async () => {
      // session kullanıldı çünkü patient ve user aynı anda oluşmalı.
      const { confirmPassword, ...rest } = req.body;

      const user = await User.create([{ ...rest, role: "patient" }], {
        session,
      });

      patient = await Patient.create([{ userId: user[0]._id }], {
        session,
      });

      // sadece response için
      const plain = user[0].toObject();
      delete plain.password;
      userWithoutPassword = plain;

      /* Burada .toObject() gerekli, çünkü user[0], bir Mongoose Document, düz bir JavaScript objesi değil.
      Destructuring'in düzgün çalışması için önce düz objeye çevirmek gerekiyor. */
    });

    return sendSuccessResponse(
      res,
      201,
      {
        user: userWithoutPassword,
        patient: patient[0],
      },
      "Patient registered successfully.",
    );
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

const login = async (req, res, next) => {
  // TODO validation

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password").lean();
    if (!user) {
      return next(new AppError("Invalid credentials", 400));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return next(new AppError("Invalid credentials", 400));
    }

    const accessToken = signAccessToken(user);

    const jti = createJti();
    const refreshToken = signRefreshToken(user, jti);

    await persistRefreshToken({
      user,
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const tokenHash = hashToken(token);
    const doc = await RefreshToken.findOne({
      tokenHash,
      jti: decoded.jti,
    }).populate("user");

    if (!doc) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }
    if (doc.revokedAt) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }
    if (doc.expiresAt < new Date()) {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    const result = await rotateRefreshToken(doc, doc.user, req, res);
    return res.json({ accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      const tokenHash = hashToken(token);
      const doc = await refreshToken.findOne({ tokenHash });
      if (doc && !doc.revokedAt) {
        doc.revokedAt = new Date();
        await doc.save();
      }
    }
    res.clearCookie("refresh_token", { path: "/api/auth/refresh" });
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerPatient, login, refresh, logout };
