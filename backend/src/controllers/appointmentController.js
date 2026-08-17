const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const Appointment = require("../models/Appointment");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const isIdValid = require("../utils/isIdValid");

const getAppointments = async (req, res, next) => {
  // TODO patient ve doctor tüm appleri görmemeli!!
  try {
    const filter = { isDeleted: false };

    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }

    const appointments = await Appointment.find(filter)
      .sort({ dateAndTime: 1 })
      .lean();

    return sendSuccessResponse(res, 200, appointments);
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    isIdValid(id);

    const appointment = await Appointment.findOne({
      _id: id,
      isDeleted: false,
    }).lean();

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }
    return sendSuccessResponse(res, 200, appointment);
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req, res, next) => {
  try {
    // TODO - İlerde model içindeki validate olarak yaz

    const { doctorId, patientId } = req.body;

    const [doctor, patient] = await Promise.all([
      Doctor.findById(req.body.doctorId),
      Patient.findById(req.body.patientId),
    ]);

    if (!doctor) return next(new AppError("Doctor could not be found!", 400));

    if (!patient) return next(new AppError("Patient could not be found!", 400));

    //

    const appointment = await Appointment.create(req.body);

    return sendSuccessResponse(
      res,
      201,
      appointment,
      "Appointment created successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    isIdValid(id);

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      appointment,
      "Appointment updated successfully!",
    );
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    isIdValid(id);

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      null,
      "Appointment is deleted successfully!",
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
