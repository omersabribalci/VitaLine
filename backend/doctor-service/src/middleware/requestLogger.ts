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
  const startedAt = Date.now();

  req.headers["x-request-id"] = requestId;
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    console.info(
      JSON.stringify({
        service: "doctor-service",
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
