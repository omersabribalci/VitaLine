type Request = import("express").Request;
type Response = import("express").Response;
const database = require("../config/database.js");

const liveness = (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "appointment-service" });
};

const readiness = (_req: Request, res: Response) => {
  if (!database.isDatabaseReady()) {
    res.status(503).json({ status: "not-ready", service: "appointment-service" });
    return;
  }

  res.status(200).json({ status: "ready", service: "appointment-service" });
};

module.exports = { liveness, readiness };
