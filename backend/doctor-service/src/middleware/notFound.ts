type Request = import("express").Request;
type Response = import("express").Response;

const notFound = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Doctor Service route not found.",
  });
};

module.exports = { notFound };
