type ServerResponse = import("node:http").ServerResponse;
type IncomingMessage = import("node:http").IncomingMessage;

const sendProxyError = (
  error: Error,
  req: IncomingMessage,
  res: ServerResponse,
) => {
  console.error(
    JSON.stringify({
      service: "api-gateway",
      requestId: req.headers["x-request-id"] || "unknown",
      message: "Upstream service is unavailable.",
      error: error.message,
    }),
  );

  if (!res.headersSent) {
    res.writeHead(502, { "content-type": "application/json" });
  }

  res.end(
    JSON.stringify({
      success: false,
      message: "Upstream service is unavailable.",
    }),
  );
};

module.exports = { sendProxyError };
