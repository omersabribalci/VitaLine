const axios = require("axios");
const AppError = require("../utils/AppError.js");

const http = axios.create({
  baseURL: process.env.DOCTOR_SERVICE_URL || "http://localhost:5003",
  timeout: 3000,
  headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
});

const request = async (
  method: "get" | "post",
  path: string,
  requestId: string,
  body?: object,
) => {
  try {
    const response = await http.request({
      method,
      url: path,
      data: body,
      headers: { "x-request-id": requestId },
    });
    return response.data?.data;
  } catch (error) {
    if (axios.isAxiosError(error) && (error as any).response?.status === 404) {
      return null;
    }
    const message = axios.isAxiosError(error)
      ? (error as any).response?.data?.message || (error as any).message
      : "Doctor Service request failed.";
    throw new AppError(message, 503);
  }
};

const getById = async (doctorId: string, requestId: string) => {
  const data = await request(
    "get",
    "/internal/doctors/" + encodeURIComponent(doctorId),
    requestId,
  );
  return data?.doctor || null;
};

const getByUserId = async (userId: string, requestId: string) => {
  const data = await request(
    "get",
    "/internal/doctors/by-user/" + encodeURIComponent(userId),
    requestId,
  );
  return data?.doctor || null;
};

const resolveByIds = async (doctorIds: string[], requestId: string) => {
  if (doctorIds.length === 0) return [];
  const data = await request(
    "post",
    "/internal/doctors/resolve",
    requestId,
    { doctorIds },
  );
  return Array.isArray(data?.doctors) ? data.doctors : [];
};

const countActive = async (requestId: string) => {
  const data = await request("get", "/internal/doctors/count", requestId);
  return Number(data?.count || 0);
};

module.exports = {
  getById,
  getByUserId,
  resolveByIds,
  countActive,
};
