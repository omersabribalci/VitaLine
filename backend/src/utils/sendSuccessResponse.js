const sendSuccessResponse = (res, statusCode, data = null, message = "") => {
  res.status(statusCode).json({ success: true, message, data });
};

module.exports = sendSuccessResponse;
