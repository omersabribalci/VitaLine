const { rateLimit } = require("express-rate-limit");
import type { Request, Response } from "express";

const rateLimitHandler = (_req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
  });
};

// Integration tests share one local IP and can legitimately make many requests.
// Production and development limits remain unchanged.
const testSafeLimit = (normalLimit: number): number =>
  process.env.NODE_ENV === "test" ? 10_000 : normalLimit;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: testSafeLimit(100),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: testSafeLimit(10),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { globalLimiter, authLimiter };
