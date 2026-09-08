const winston = require("winston");
const path = require("node:path");
import type { TransformableInfo } from "logform";

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info: TransformableInfo) =>
      `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`,
  ),
);

// Containers should write logs to stdout/stderr so the runtime platform can
// collect them. Local development keeps the existing log files for convenience.
const fileTransports =
  process.env.NODE_ENV === "production"
    ? []
    : [
        new winston.transports.File({
          level: "error",
          filename: path.join(__dirname, "..", "logs", "error.log"),
          format: fileFormat,
        }),
        new winston.transports.File({
          filename: path.join(__dirname, "..", "logs", "combined.log"),
          format: fileFormat,
        }),
      ];

const logger = winston.createLogger({
  level: "info",
  transports: [...fileTransports, new winston.transports.Console()],
});

module.exports = logger;
