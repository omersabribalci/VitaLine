type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;
const { verifyAccessToken } = require("../utils/tokens.js");

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const [scheme, token] = (req.header("authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return;
  }

  try {
    res.locals.authUser = verifyAccessToken(
      token,
      process.env.ACCESS_TOKEN_SECRET || "",
    );
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid access token." });
  }
};

module.exports = { authenticate };
