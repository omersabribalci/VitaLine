type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const doctorService = require("../services/doctorService.js");

const countDoctors = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await doctorService.countDoctors();
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

const findDoctorForAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doctor = await doctorService.getDoctorForAppointment(
      String(req.params.doctorId),
    );
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found." });
      return;
    }
    res.status(200).json({ success: true, data: { doctor } });
  } catch (error) {
    next(error);
  }
};

const findDoctorByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doctor = await doctorService.getDoctorForAppointmentByUserId(
      String(req.params.userId),
    );
    if (!doctor) {
      res.status(404).json({ success: false, message: "Doctor profile not found." });
      return;
    }
    res.status(200).json({ success: true, data: { doctor } });
  } catch (error) {
    next(error);
  }
};

const resolveDoctors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await doctorService.resolveDoctorsForAppointments(
      req.body.doctorIds,
    );
    res.status(200).json({ success: true, data: { doctors } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  countDoctors,
  findDoctorForAppointment,
  findDoctorByUserId,
  resolveDoctors,
};
