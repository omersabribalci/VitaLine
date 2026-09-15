type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const sessionService = require("../services/authSessions.js");
const registrationService = require("../services/registerPatient.js");
const {
  clearRefreshCookie,
  readCookie,
  setRefreshCookie,
} = require("../utils/cookies.js");

const requestContext = (req: Request) => ({
  requestId: req.header("x-request-id") || "missing-request-id",
  ip: req.ip,
  userAgent: req.header("user-agent") || "",
});

const useSecureCookies = () => process.env.NODE_ENV === "production";

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sessionService.login(
      {
        email: String(req.body.email).trim().toLowerCase(),
        password: String(req.body.password),
      },
      requestContext(req),
    );
    setRefreshCookie(res, result.refreshToken, useSecureCookies());
    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      data: { token: result.accessToken, user: result.user },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = readCookie(req.header("cookie"), "refresh_token");
    if (!rawToken) {
      throw new sessionService.AuthSessionError("No refresh token", 401);
    }

    const result = await sessionService.refresh(rawToken, requestContext(req));
    setRefreshCookie(res, result.refreshToken, useSecureCookies());
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully!",
      data: { token: result.accessToken, user: result.user },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sessionService.logout(
      readCookie(req.header("cookie"), "refresh_token"),
    );
    clearRefreshCookie(res, useSecureCookies());
    res.status(200).json({
      success: true,
      message: "Logged out successfully!",
      data: null,
    });
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
    const result = await registrationService.registerPatient(
      {
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        phone: req.body.phone,
        password: req.body.password,
        image: req.body.image || "",
      },
      requestContext(req).requestId,
    );
    res.status(201).json({
      success: true,
      message: "Patient registered successfully.",
      data: {
        user: result.user,
        patient: {
          _id: result.patient.id,
          userId: result.patient.userId,
          accountStatus: result.patient.accountStatus,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, refreshToken, logout, registerPatient };
