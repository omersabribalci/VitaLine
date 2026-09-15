type Request = import("express").Request;
type Response = import("express").Response;

const health = (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
};

module.exports = { health };
