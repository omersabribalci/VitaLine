const axios = require("axios");
const AppError = require("../utils/AppError.js");

const http = axios.create({
  baseURL: process.env.PATIENT_SERVICE_URL || "http://localhost:5002",
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
      : "Patient Service request failed.";
    throw new AppError(message, 503);
  }
};

const getById = async (patientId: string, requestId: string) => {
  const data = await request(
    "get",
    "/internal/patients/" + encodeURIComponent(patientId),
    requestId,
  );
  return data?.patient || null;
};

const getByUserId = async (userId: string, requestId: string) => {
  const data = await request(
    "get",
    "/internal/patients/by-user/" + encodeURIComponent(userId),
    requestId,
  );
  return data?.patient || null;
};

const resolveByIds = async (patientIds: string[], requestId: string) => {
  if (patientIds.length === 0) return [];
  const data = await request(
    "post",
    "/internal/patients/resolve",
    requestId,
    { patientIds },
  );
  return Array.isArray(data?.patients) ? data.patients : [];
};

const countActive = async (requestId: string) => {
  const data = await request("get", "/internal/patients/count", requestId);
  return Number(data?.count || 0);
};

module.exports = {
  getById,
  getByUserId,
  resolveByIds,
  countActive,
};
