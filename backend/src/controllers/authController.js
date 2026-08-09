"use strict";
const mongoose = require("mongoose");
const User = require("../models/User");
const Patient = require("../models/Patient");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const AppError = require("../utils/AppError");

const registerPatient = async (req, res, next) => {
  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError("Passwords do not match!", 400));
  }

  const session = await mongoose.startSession();

  let userWithoutPassword;
  let patient;

  try {
    await session.withTransaction(async () => {
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

module.exports = registerPatient;
