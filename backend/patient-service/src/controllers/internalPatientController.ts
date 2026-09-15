type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const patientService = require("../services/patientService.js");

const countPatients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const total = await patientService.countPatients();
    res.status(200).json({ success: true, data: { count: total } });
  } catch (error) {
    next(error);
  }
};

const registerPatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patient = await patientService.registerPatientProfile(
      String(req.body.userId),
    );
    res.status(201).json({
      success: true,
      data: { patient },
      message: "Patient profile created.",
    });
  } catch (error) {
    next(error);
  }
};

const findPatientByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patient = await patientService.getPatientForAppointmentByUserId(
      String(req.params.userId),
    );
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient profile not found." });
      return;
    }
    res.status(200).json({ success: true, data: { patient } });
  } catch (error) {
    next(error);
  }
};

const findPatientForAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patient = await patientService.getPatientForAppointment(
      String(req.params.patientId),
    );
    if (!patient) {
      res.status(404).json({ success: false, message: "Patient profile not found." });
      return;
    }
    res.status(200).json({ success: true, data: { patient } });
  } catch (error) {
    next(error);
  }
};

const resolvePatients = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patients = await patientService.resolvePatientsForAppointments(
      req.body.patientIds,
    );
    res.status(200).json({ success: true, data: { patients } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  countPatients,
  registerPatient,
  findPatientByUserId,
  findPatientForAppointment,
  resolvePatients,
};
