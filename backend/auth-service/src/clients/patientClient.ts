const axios = require("axios");

const http = axios.create({
  baseURL: process.env.PATIENT_SERVICE_URL || "http://localhost:5002",
  timeout: 3000,
  headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
});

class PatientServiceError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getAxiosError = (error: unknown) => {
  if (!axios.isAxiosError(error)) return null;
  return error as {
    message: string;
    response?: { status?: number; data?: { message?: string } };
  };
};

const readPatient = (body: any) => {
  const patient = body?.data?.patient;
  if (!patient?.id || !patient.userId || !patient.accountStatus) {
    throw new PatientServiceError("Patient Service returned invalid data.", 503);
  }

  return {
    id: patient.id,
    userId: patient.userId,
    accountStatus: patient.accountStatus,
  };
};

const createPatient = async (userId: string, requestId: string) => {
  try {
    const response = await http.post(
      "/internal/patients",
      { userId },
      { headers: { "x-request-id": requestId } },
    );
    return readPatient(response.data);
  } catch (error) {
    if (error instanceof PatientServiceError) throw error;
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;
    throw new PatientServiceError(
      axiosError?.response?.data?.message ||
        axiosError?.message ||
        "Patient Service call failed.",
      status,
    );
  }
};

const getPatientByUserId = async (userId: string, requestId: string) => {
  try {
    const response = await http.get(
      `/internal/patients/by-user/${encodeURIComponent(userId)}`,
      { headers: { "x-request-id": requestId } },
    );
    return readPatient(response.data);
  } catch (error) {
    if (error instanceof PatientServiceError) throw error;
    const axiosError = getAxiosError(error);
    const status = axiosError?.response?.status;
    if (status === 404) return null;

    throw new PatientServiceError(
      axiosError?.response?.data?.message ||
        axiosError?.message ||
        "Patient Service call failed.",
      status,
    );
  }
};

module.exports = { PatientServiceError, createPatient, getPatientByUserId };
