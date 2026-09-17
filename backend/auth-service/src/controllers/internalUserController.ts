type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const userService = require("../services/userService.js");

const createDoctorUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.createDoctorUser(req.body);
    res.status(201).json({
      success: true,
      data: { user },
      message: "Doctor user created.",
    });
  } catch (error) {
    next(error);
  }
};

const resolveUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.resolveUsers(req.body.userIds);
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.updateUserProfile(
      String(req.params.id),
      req.body,
    );
    res.status(200).json({
      success: true,
      data: { user },
      message: "User profile updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const updateUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await userService.updateUserPassword(
      String(req.params.id),
      String(req.body.password),
    );
    res.status(200).json({
      success: true,
      data: null,
      message: "User password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await userService.deactivateUser(
      String(req.params.id),
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "User deactivated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctorUser,
  resolveUsers,
  updateUserProfile,
  updateUserPassword,
  deactivateUser,
};
