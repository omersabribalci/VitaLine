const sendSuccessResponse = (res, statusCode, data, message = "") => {
  res.status(statusCode).json({ success: true, message, data });
};

module.exports = sendSuccessResponse;
