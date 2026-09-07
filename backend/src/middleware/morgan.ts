const morgan = require("morgan");
const logger = require("./logger");

const stream = {
  write: (message: string) => logger.info(message.trim()),
};

const morganMiddleware = morgan(
  ":method :url :status :response-time ms - :res[content-length]",
  { stream },
);
module.exports = morganMiddleware;
