const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const AppError = require("../utils/AppError");
const User = require("../models/User");

const getDoctors = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.speciality) {
      filter.speciality = req.query.speciality;
    }

    const doctors = await Doctor.find(filter).populate("userId").lean();

    return sendSuccessResponse(res, 200, doctors);
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(`Invalid id format! ${id}`, 400));
    }

    const doctor = await Doctor.findById(id).populate("userId").lean();

    if (!doctor) {
      return next(
        new AppError(`Doctor does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(res, 200, doctor);
  } catch (error) {
    next(error);
  }
};

const createDoctor = async (req, res, next) => {
  const session = await mongoose.startSession();

  let userWithoutPassword;
  let doctor;

  try {
    const { title, name, email, phone, image, password, speciality } = req.body;

    const userObj = {
      name: name,
      email: email,
      phone: phone,
      password: password,
      role: "doctor",
    };

    const user = await User.create([userObj], { session });

    const doctorObj = {
      userId: user[0]._id,
      title: title,
      image: image,
      speciality: speciality,
    };

    const doctor = await Doctor.create([doctorObj], { session });

    const plain = user[0].toObject();
    delete plain.password;
    userWithoutPassword = plain;

    return sendSuccessResponse(
      res,
      201,
      {
        user: userWithoutPassword,
        doctor: doctor[0],
      },
      "Doctor created successfully.",
    );
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = { getDoctors, getDoctorById, createDoctor };
