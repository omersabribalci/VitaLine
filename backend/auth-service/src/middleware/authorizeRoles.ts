type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
type UserRole = "admin" | "doctor" | "patient";

const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (_req: Request, res: Response, next: NextFunction) => {
    const role = res.locals.authUser?.role as UserRole | undefined;

    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({ success: false, message: "Forbidden." });
      return;
    }

    next();
  };
};

module.exports = { authorizeRoles };
