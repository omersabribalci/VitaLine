type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const bookingPolicyService = require("../services/bookingPolicy.js");

const getBookingPolicy = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const policy = await bookingPolicyService.getBookingPolicy();
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    next(error);
  }
};

const updateBookingPolicy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policy = await bookingPolicyService.updateBookingPolicy(req.body);
    res.status(200).json({
      success: true,
      data: policy,
      message: "Booking policy updated successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBookingPolicy, updateBookingPolicy };
