const mongoose = require("mongoose");
const Doctor = require("../models/Doctor");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const isIdValid = require("../utils/isIdValid");

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

    isIdValid(id);

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

const getMyDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate("userId")
      .lean();

    if (!doctor) {
      return next(new AppError("Doctor profile not found for this user.", 404));
    }

    return sendSuccessResponse(res, 200, doctor);
  } catch (error) {
    next(error);
  }
};

const createDoctor = async (req, res, next) => {
  let session;
  let userWithoutPassword;
  let doctor;

  try {
    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const { title, name, email, phone, image, password, speciality } =
        req.body;

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

      doctor = await Doctor.create([doctorObj], { session });

      const plain = user[0].toObject();
      delete plain.password;
      userWithoutPassword = plain;
    });

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
    if (session) {
      session.endSession();
    }
  }
};

const updateDoctor = async (req, res, next) => {
  const { id } = req.params;
  let session;

  try {
    isIdValid(id);

    if (req.user.role === "doctor") {
      const targetDoctor = await Doctor.findById(id);
      if (!targetDoctor || targetDoctor.userId.toString() !== req.user.id) {
        return next(new AppError("You can only update your own profile.", 403));
      }
    }

    let resData;

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const {
        name,
        email,
        phone, // User alanları
        title,
        image,
        speciality,
        unavailableDates, // Doctor alanları
      } = req.body;

      const doctorData = { title, image, speciality, unavailableDates };
      const userData = { name, email, phone };

      let { password } = req.body;

      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      const doctor = await Doctor.findByIdAndUpdate(id, doctorData, {
        returnDocument: "after",
        runValidators: true,
        session: session,
      });

      if (!doctor) {
        throw new AppError(`Doctor does not exist with this ID -> ${id}`, 404);
      }

      const user = await User.findByIdAndUpdate(doctor.userId, userData, {
        returnDocument: "after",
        runValidators: true,
        session: session,
      });

      resData = await doctor.populate("userId");
    });

    return sendSuccessResponse(
      res,
      200,
      resData,
      "Doctor updated successfully!",
    );
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

const deleteDoctor = async (req, res, next) => {
  const { id } = req.params;
  let session;

  try {
    isIdValid(id);

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const doctor = await Doctor.findByIdAndUpdate(
        id,
        { isDeleted: true },
        {
          returnDocument: "after",
          runValidators: true,
          session: session,
        },
      );

      if (!doctor) {
        throw new AppError(`Doctor does not exist with this ID -> ${id}`, 404);
      }

      const user = await User.findByIdAndUpdate(
        doctor.userId,
        { isDeleted: true },
        {
          returnDocument: "after",
          runValidators: true,
          session: session,
        },
      );

      if (!user) {
        throw new AppError(`User does not exist with this ID -> ${id}`, 404);
      }
    });

    return sendSuccessResponse(res, 200, null, "Doctor deleted successfully!");
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getMyDoctorProfile,
};
