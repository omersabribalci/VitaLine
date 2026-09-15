type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const appointmentService = require("../services/createAppointment.js");
const availabilityService = require("../services/availability.js");
const directoryService = require("../services/appointmentDirectory.js");
const mutationService = require("../services/mutateAppointment.js");
const statisticsService = require("../services/appointmentStatistics.js");

const getAppointmentStatistics = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const statistics = await statisticsService.getAppointmentStatistics(res.locals.requestId);
    res.status(200).json({ success: true, data: statistics });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await directoryService.getAppointments(res.locals.authUser, {
      ...res.locals.appointmentListQuery,
      requestId: res.locals.requestId,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await availabilityService.getAvailability(
      String(req.query.doctorId),
      String(req.query.date),
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.createAppointment(res.locals.authUser, {
      doctorId: req.body.doctorId,
      patientId: req.body.patientId,
      dateAndTime: req.body.dateAndTime,
      status: req.body.status,
      requestId: res.locals.requestId,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        dateAndTime: appointment.dateAndTime,
        status: appointment.status,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      },
      message: "Appointment created successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await directoryService.getAppointmentById(
      res.locals.authUser,
      String(req.params.id),
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await mutationService.updateAppointment(
      res.locals.authUser,
      String(req.params.id),
      { ...req.body, requestId: res.locals.requestId },
    );
    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};

const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mutationService.deleteAppointment(String(req.params.id));
    res.status(200).json({
      success: true,
      data: null,
      message: "Appointment is deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointmentStatistics,
  getAppointments,
  getAvailability,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
