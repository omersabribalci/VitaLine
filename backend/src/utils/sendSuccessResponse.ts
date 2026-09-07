import type { Response } from "express";

const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  data: unknown = null,
  message = "",
) => {
  res.status(statusCode).json({ success: true, message, data });
};

export = sendSuccessResponse;
