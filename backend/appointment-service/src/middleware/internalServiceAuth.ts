const { timingSafeEqual } = require("node:crypto");
type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;

const secretsMatch = (received: string, expected: string) => {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
};

const internalServiceAuth = (req: Request, res: Response, next: NextFunction) => {
  const receivedKey = req.header("x-internal-api-key") || "";
  const expectedKey = process.env.INTERNAL_API_KEY || "";

  if (!expectedKey || !secretsMatch(receivedKey, expectedKey)) {
    res.status(401).json({ success: false, message: "Internal authentication required." });
    return;
  }

  next();
};

module.exports = { internalServiceAuth };
