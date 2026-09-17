type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const doctorService = require("../services/doctorService.js");

const createDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await doctorService.createDoctor(
      req.body,
      res.locals.requestId,
    );
    res.status(201).json({
      success: true,
      message: "Doctor created successfully.",
      data: {
        user: result.user,
        doctor: {
          _id: result.doctor.id,
          userId: result.doctor.userId,
          title: result.doctor.title,
          speciality: result.doctor.speciality,
          unavailableDates: result.doctor.unavailableDates,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDoctors = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await doctorService.getDoctors(
      res.locals.doctorListQuery,
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDoctorCatalog = (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({
      success: true,
      data: doctorService.getDoctorCatalog(),
    });
  } catch (error) {
    next(error);
  }
};

const getAvailableSpecialities = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const specialities = await doctorService.getAvailableSpecialities();
    res.status(200).json({ success: true, data: specialities });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctor = await doctorService.getDoctorById(
      String(req.params.id),
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

const getMyDoctorProfile = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doctor = await doctorService.getDoctorByUserId(
      res.locals.authUser.id,
      res.locals.requestId,
    );
    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = String(req.params.id);
    await doctorService.updateDoctor(
      doctorId,
      { id: res.locals.authUser.id, role: res.locals.authUser.role },
      req.body,
      res.locals.requestId,
    );
    const doctor = await doctorService.getDoctorById(
      doctorId,
      res.locals.requestId,
    );
    res.status(200).json({
      success: true,
      data: doctor,
      message: "Doctor profile updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await doctorService.deleteDoctor(
      String(req.params.id),
      res.locals.requestId,
    );
    res.status(200).json({
      success: true,
      data: null,
      message: "Doctor deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctorCatalog,
  getAvailableSpecialities,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  deleteDoctor,
};
