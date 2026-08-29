const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const AppError = require("../utils/AppError");
const isIdValid = require("../utils/isIdValid");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().populate("userId").lean();

    return sendSuccessResponse(res, 200, patients);
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    isIdValid(id);

    const patient = await Patient.findById(id).populate("userId").lean();

    if (!patient) {
      return next(
        new AppError(`Patient does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(res, 200, patient);
  } catch (error) {
    next(error);
  }
};

const getMyPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      userId: req.user.id,
    })
      .populate("userId")
      .lean();

    if (!patient) {
      return next(
        new AppError("Patient profile not found for this user.", 404),
      );
    }

    return sendSuccessResponse(res, 200, patient);
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  const { id } = req.params;

  try {
    isIdValid(id);

    const { accountStatus } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { accountStatus: accountStatus },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!patient) {
      return next(
        new AppError(`Patient does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      patient,
      "Patient updated successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  const { id } = req.params;
  let session;
  try {
    isIdValid(id);

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      const patient = await Patient.findByIdAndUpdate(
        id,
        { isDeleted: true },
        {
          returnDocument: "after",
          runValidators: true,
          session: session,
        },
      );

      if (!patient) {
        throw new AppError(`Patient does not exist with this ID -> ${id}`, 404);
      }

      const user = await User.findByIdAndUpdate(
        patient.userId,
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

      await Appointment.updateMany(
        { patientId: patient._id },
        { $set: { isDeleted: true } },
        { session: session },
      );
    });

    return sendSuccessResponse(res, 200, null, "Patient deleted successfully!");
  } catch (error) {
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

module.exports = {
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
};
