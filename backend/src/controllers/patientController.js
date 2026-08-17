const Patient = require("../models/Patient");
const AppError = require("../utils/AppError");
const isIdValid = require("../utils/isIdValid");
const sendSuccessResponse = require("../utils/sendSuccessResponse");

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

module.exports = { getPatients, getPatientById, updatePatient };
