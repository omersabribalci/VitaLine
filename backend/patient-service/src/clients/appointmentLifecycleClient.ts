const axios = require("axios");
const AppError = require("../utils/AppError.js");

const http = axios.create({
  baseURL: process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5004",
  timeout: 3000,
  headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY || "" },
});

const cancelForPatient = async (patientId: string, requestId?: string) => {
  try {
    await http.post(
      "/internal/appointments/cancel-by-patient/" +
        encodeURIComponent(patientId),
      undefined,
      { headers: requestId ? { "x-request-id": requestId } : undefined },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new AppError(
      "Appointment Service cancellation failed: " + message,
      503,
    );
  }
};

module.exports = { cancelForPatient };
