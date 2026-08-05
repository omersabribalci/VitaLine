const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const Appointment = require("../models/Appointment");
const sendSuccessResponse = require("../utils/sendSuccessResponse");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const getAppointments = async (req, res, next) => {
  try {
    const filter = {};

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

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(`Invalid id format! ${id}`, 400));
    }

    const appointment = await Appointment.findById(id).lean();

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

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(`Invalid id format! -> ${id}`, 400));
    }

    const appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

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

    if (!mongoose.isValidObjectId(id)) {
      return next(new AppError(`Invalid id format! -> ${id}`, 400));
    }

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return next(
        new AppError(`Appointment does not exist with this ID -> ${id}`, 404),
      );
    }

    return sendSuccessResponse(
      res,
      200,
      appointment,
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
