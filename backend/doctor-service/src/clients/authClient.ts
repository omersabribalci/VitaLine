const axios = require("axios");
const AppError = require("../utils/AppError.js");

const http = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
  timeout: 3000,
  headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
});

const requestError = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return new AppError(fallback, 503);

  const axiosError = error as {
    message?: string;
    response?: { status?: number; data?: { message?: string } };
  };
  const status = axiosError.response?.status;
  return new AppError(
    axiosError.response?.data?.message || axiosError.message || fallback,
    status && status < 500 ? status : 503,
  );
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
    throw requestError(error, "Auth Service request failed.");
  }
};

const createDoctorUser = async (
  input: Record<string, unknown>,
  requestId?: string,
) => {
  try {
    const response = await http.post("/internal/users/doctors", input, {
      headers: requestId ? { "x-request-id": requestId } : undefined,
    });
    const user = response.data?.data?.user;
    if (!user?._id) {
      throw new AppError("Auth Service returned invalid user data.", 503);
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw requestError(error, "Doctor user could not be created.");
  }
};

const updateUserProfile = async (
  userId: string,
  changes: Record<string, unknown>,
  requestId?: string,
) => {
  try {
    const response = await http.patch(
      "/internal/users/" + encodeURIComponent(userId) + "/profile",
      changes,
      { headers: requestId ? { "x-request-id": requestId } : undefined },
    );
    const user = response.data?.data?.user;
    if (!user?._id) {
      throw new AppError("Auth Service returned invalid user data.", 503);
    }
    return user;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw requestError(error, "User profile could not be updated.");
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
    throw requestError(error, "User could not be deactivated.");
  }
};

module.exports = {
  resolveUsers,
  createDoctorUser,
  updateUserProfile,
  deactivateUser,
};
