type Request = import("express").Request;
type Response = import("express").Response;
const { rateLimit } = require("express-rate-limit");

const rateLimitHandler = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

// Tests send many requests from the same local IP. Production keeps the real limits.
const testSafeLimit = (productionLimit: number) =>
  process.env.NODE_ENV === "test" ? 10_000 : productionLimit;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: testSafeLimit(100),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: testSafeLimit(10),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { globalLimiter, authLimiter };
