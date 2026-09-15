const axios = require("axios");
const AppError = require("../utils/AppError.js");

const http = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  timeout: 3000,
  headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
});

const resolveUsers = async (userIds: string[], requestId: string) => {
  if (userIds.length === 0) return [];

  try {
    const response = await http.post(
      "/internal/users/resolve",
      { userIds },
      { headers: { "x-request-id": requestId } },
    );
    const users = response.data?.data?.users;
    if (!Array.isArray(users)) {
      throw new AppError("Auth Service returned invalid data.", 503);
    }
    return users;
  } catch (error) {
    if (error instanceof AppError) throw error;
    const message = axios.isAxiosError(error)
      ? (error as any).response?.data?.message || (error as any).message
      : "Auth Service request failed.";
    throw new AppError(message, 503);
  }
};

module.exports = { resolveUsers };
