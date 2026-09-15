type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
type UserRole = "admin" | "doctor" | "patient";

const authorizeRoles = (...roles: UserRole[]) =>
  (_req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(res.locals.authUser?.role)) {
      res.status(403).json({ success: false, message: "Forbidden." });
      return;
    }
    next();
  };

module.exports = { authorizeRoles };
