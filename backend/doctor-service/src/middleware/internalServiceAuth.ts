const { timingSafeEqual } = require("node:crypto");
type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;

const secretsMatch = (received: string, expected: string) => {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
};

const internalServiceAuth = (req: Request, res: Response, next: NextFunction) => {
  const receivedKey = req.header("x-internal-api-key") || "";
  const expectedKey = process.env.INTERNAL_API_KEY || "";

  if (!expectedKey || !secretsMatch(receivedKey, expectedKey)) {
    res.status(401).json({ success: false, message: "Unauthorized service." });
    return;
  }

  next();
};

module.exports = { internalServiceAuth };
