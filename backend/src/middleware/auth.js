const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, tokenFromHeader] = header.split(" ");
  const tokenFromCookie = req.cookies?.access_token;

  const token =
    scheme === "Bearer" && tokenFromHeader ? tokenFromHeader : tokenFromCookie;

  if (!token) {
    return next(new AppError("No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

    next();
  } catch (error) {
    const msg =
      error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid token";
    return next(new AppError(msg, 401));
  }
};

module.exports = verifyToken;
