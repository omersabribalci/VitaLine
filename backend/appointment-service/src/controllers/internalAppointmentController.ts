type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const cancellationService = require("../services/cancelOwnerAppointments.js");

const cancelPatientAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cancellationService.cancelOwnerAppointments("patient", String(req.params.ownerId));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const cancelDoctorAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cancellationService.cancelOwnerAppointments("doctor", String(req.params.ownerId));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { cancelPatientAppointments, cancelDoctorAppointments };
