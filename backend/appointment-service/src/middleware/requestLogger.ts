const { randomUUID } = require("node:crypto");
type NextFunction = import("express").NextFunction;
type Request = import("express").Request;
type Response = import("express").Response;

const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.header("x-request-id") || randomUUID();
  req.headers["x-request-id"] = requestId;
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  const startedAt = Date.now();

  res.on("finish", () => {
    console.info(
      JSON.stringify({
        service: "appointment-service",
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt,
      }),
    );
  });

  next();
};

module.exports = { requestLogger };
