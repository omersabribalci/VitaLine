type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const patientService = require("../services/patientService.js");

const getPatients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await patientService.getPatients(
      res.locals.patientListQuery,
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMyPatientProfile = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patient = await patientService.getPatientByUserId(
      res.locals.authUser.id,
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patient = await patientService.getPatientById(
      String(req.params.id),
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const patientId = String(req.params.id);
    await patientService.updatePatient(patientId, req.body.accountStatus);
    const patient = await patientService.getPatientById(
      patientId,
      res.locals.requestId,
    );
    res.status(200).json({
      success: true,
      data: patient,
      message: "Patient updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await patientService.deletePatient(
      String(req.params.id),
      res.locals.requestId,
    );
    res.status(200).json({
      success: true,
      data: null,
      message: "Patient deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getMyPatientProfile,
  getPatientById,
  updatePatient,
  deletePatient,
};
