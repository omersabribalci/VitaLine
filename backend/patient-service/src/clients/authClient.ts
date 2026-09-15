const axios = require("axios");
const AppError = require("../utils/AppError.js");

const http = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  timeout: 3000,
  headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
});

const errorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  const axiosError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return axiosError.response?.data?.message || axiosError.message || fallback;
};

const resolveUsers = async (userIds: string[], requestId?: string) => {
  try {
    const response = await http.post(
      "/internal/users/resolve",
      { userIds },
      { headers: requestId ? { "x-request-id": requestId } : undefined },
    );
    const users = response.data?.data?.users;
    if (!Array.isArray(users)) {
      throw new AppError("Auth Service returned invalid user data.", 503);
    }
    return users;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(errorMessage(error, "Auth Service request failed."), 503);
  }
};

const deactivateUser = async (userId: string, requestId?: string) => {
  try {
    await http.post(
      "/internal/users/" + encodeURIComponent(userId) + "/deactivate",
      undefined,
      { headers: requestId ? { "x-request-id": requestId } : undefined },
    );
  } catch (error) {
    throw new AppError(
      errorMessage(error, "User could not be deactivated."),
      503,
    );
  }
};

module.exports = { resolveUsers, deactivateUser };
