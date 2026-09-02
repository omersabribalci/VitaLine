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
  REFRESH_GRACE_MS,
} = require("../utils/tokens");
const RefreshToken = require("../models/RefreshToken");

const registerPatient = async (req, res, next) => {
  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError("Passwords do not match!", 400));
  }

  let session;
  let userWithoutPassword;
  let patient;

  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      // session kullanıldı çünkü patient ve user aynı anda oluşmalı.
      const { name, email, phone, password, image } = req.body;
      const userData = {
        name,
        email,
        phone,
        password,
        image: image || "",
        role: "patient",
      };

      const user = await User.create([userData], {
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
    if (session) {
      session.endSession();
    }
  }
};

const login = async (req, res, next) => {
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

    if (user.role === "patient") {
      const patient = await Patient.findOne({ userId: user._id });

      if (patient && patient.accountStatus === "disabled") {
        return next(new AppError("Account is disabled", 400));
      }
    }

    const accessToken = signAccessToken(user); // access token üretimi

    const jti = createJti(); // jti; her token'a özel bir parmak izi vererek, token'ların veritabanındaki yaşam döngüsünü ve çalınma durumlarını kontrol etmemizi sağlayan kilit mekanizmadır.

    const refreshToken = signRefreshToken(user, jti); // refresh token üretimi

    await persistRefreshToken({
      user,
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    }); //refresh tokenı hashleme ve dbye kayıt

    setRefreshCookie(res, refreshToken); // tokenı cookie olarak yollama

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image || "",
      role: user.role,
    };

    return sendSuccessResponse(
      res,
      200,
      { token: accessToken, user: userData },
      "Logged in successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    // Tarayıcıdan/Postman'den gelen HttpOnly cookie paketi kontrol edilir.
    // Cookie yoksa hiç zorlamadan 401 No refresh token hatası dönülür.

    const token = req.cookies?.refresh_token;
    if (!token) {
      return next(new AppError("No refresh token", 401));
    }

    // jwt.verify fonksiyonu token'ın gizli anahtarla (REFRESH_TOKEN_SECRET) imzalanıp imzalanmadığını ve 7 günlük süresinin dolup dolmadığını matematiksel olarak doğrular.
    // Token sahteyse veya 7 gün geçmişse direkt catch bloğuna düşer.
    // Başarılıysa çözülen veri decoded değişkenine atanır (içinde id ve jti bulunur).

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }

    // Cookie'den gelen ham token SHA-256 ile hash'lenir.
    // DB'de bu tokenHash ve token'ın içinden çıkan jti ile eşleşen bir kayıt aranır.
    // DB'de karşılığı yoksa (silindiyse veya geçersizse) reddedilir.
    // .populate("user") ile ilgili kullanıcı bilgisi de çekilir.

    const tokenHash = hashToken(token);
    const doc = await RefreshToken.findOne({
      tokenHash,
      jti: decoded.jti,
    }).populate("user");

    if (!doc) {
      return next(new AppError("Refresh token not recognized", 401));
    }

    // Kritik Güvenlik Katmanı: Eğer bu token daha önce kullanılıp iptal edildiyse (revokedAt doluysa), ancak bir hırsız bu eski token'ı bir şekilde ele geçirip tekrar kullanmaya çalışıyorsa bu if bloğu çalışır.
    // Sistem durumu "Güvenlik İhlali" olarak değerlendirir ve o kullanıcının veritabanındaki tüm aktif oturumlarını tek sorguyla (updateMany) iptal eder.

    if (doc.revokedAt) {
      // --- ÖNCE: Grace period kontrolü (masum senaryo mu?) ---
      const elapsed = Date.now() - doc.revokedAt.getTime();

      if (elapsed <= REFRESH_GRACE_MS && doc.replacedBy) {
        const currentDoc = await RefreshToken.findOne({
          jti: doc.replacedBy,
        }).populate("user");

        if (currentDoc && !currentDoc.revokedAt) {
          const accessToken = signAccessToken(currentDoc.user);

          const currentRefreshToken = signRefreshToken(
            currentDoc.user,
            currentDoc.jti,
          );
          const newTokenHash = hashToken(currentRefreshToken);

          currentDoc.tokenHash = newTokenHash;
          await currentDoc.save();

          setRefreshCookie(res, currentRefreshToken);

          const plainUser = currentDoc.user.toObject();
          delete plainUser.password;

          const userData = {
            _id: plainUser._id,
            name: plainUser.name,
            email: plainUser.email,
            phone: plainUser.phone,
            image: plainUser.image || "",
            role: plainUser.role,
          };

          return sendSuccessResponse(
            res,
            200,
            { token: accessToken, user: userData },
            "Token refreshed successfully!",
          );
        }
      }

      // --- Tolerans dışı ya da zincirde sorun var: GERÇEK güvenlik ihlali sayılır ---

      // TEHLİKE! İptal edilmiş token tekrar kullanılıyor. Kullanıcının tüm oturumlarını kapat!
      await RefreshToken.updateMany(
        { user: decoded.id, revokedAt: null }, // Kullanıcının tüm geçerli tokenları
        { $set: { revokedAt: new Date() } },
      );

      return next(
        new AppError(
          "Token reuse detected! All sessions terminated for security.",
          401,
        ),
      );
    }

    // doc.expiresAt veritabanındaki tarih kontrol edilir.
    // Her şey temizse rotateRefreshToken çağrılarak:
    // Mevcut token DB'de iptal edilir (revokedAt atanır).
    // Yeni bir jti, yeni Access Token ve yeni Refresh Token üretilir.
    // Yeni Refresh Token DB'ye yazılır ve Cookie olarak basılır.
    // Yeni Access Token ise JSON yanıtı olarak frontend'e döndürülür.

    if (doc.expiresAt < new Date()) {
      return next(new AppError("Refresh token expired", 401));
    }

    const result = await rotateRefreshToken(doc, doc.user, req, res);

    const plainUser = doc.user.toObject();
    delete plainUser.password;

    const userData = {
      _id: plainUser._id,
      name: plainUser.name,
      email: plainUser.email,
      phone: plainUser.phone,
      image: plainUser.image || "",
      role: plainUser.role,
    };

    return sendSuccessResponse(
      res,
      200,
      { token: result.accessToken, user: userData },
      "Token refreshed successfully!",
    );
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;

    // Eğer cookie içinde token geldiyse veritabanı işlemlerini başlatır.
    // Veritabanında token'ların ham halini değil SHA-256 özetini sakladığımız için, gelen token'ı aratmadan önce aynı algoritmayla hash'liyoruz.
    // Bu hash ile veritabanındaki Refresh Token belgesini arıyoruz.
    // Kayıt bulunduysa ve hâlâ aktifse, İptal tarihini şu anki zaman damgası yapıyoruz.
    // Değişikliği MongoDB'ye kaydediyoruz.

    if (token) {
      const tokenHash = hashToken(token);
      const doc = await RefreshToken.findOne({ tokenHash });
      if (doc && !doc.revokedAt) {
        doc.revokedAt = new Date();
        await doc.save();
      }
    }
    const isProd = process.env.NODE_ENV === "production";

    // İstemcinin tarayıcısına "Elimdeki refresh_token cookie'sini derhal sil ve sıfırla" talimatı (Set-Cookie header) gönderir.

    res.clearCookie("refresh_token", {
      path: "/api/auth",
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
    });

    return sendSuccessResponse(res, 200, null, "Logged out successfully!");
  } catch (err) {
    next(err);
  }
};

module.exports = { registerPatient, login, refresh, logout };
