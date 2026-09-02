const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const Patient = require("../models/Patient");

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, tokenFromHeader] = header.split(" ");
  const tokenFromCookie = req.cookies?.access_token;

  const token =
    scheme === "Bearer" && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    const msg =
      error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid token";
    return next(new AppError(msg, 401));
  }

  try {
    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).lean();

    if (!user) {
      return next(new AppError("User session is no longer valid.", 401));
    }

    if (user.role !== decoded.role) {
      return next(new AppError("User role is no longer valid.", 401));
    }

    if (user.role === "patient") {
      const patient = await Patient.findOne({ userId: user._id }).lean();

      if (!patient) {
        return next(new AppError("Patient profile not found.", 401));
      }

      if (patient.accountStatus === "disabled") {
        return next(new AppError("Account is disabled.", 403));
      }
    }

    req.user = { id: user._id.toString(), email: user.email, role: user.role };
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = verifyToken;
