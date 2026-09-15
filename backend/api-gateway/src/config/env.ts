type GatewayConfig = {
  port: number;
  authServiceUrl: string;
  patientServiceUrl: string;
  doctorServiceUrl: string;
  appointmentServiceUrl: string;
};

const required = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`${name} environment variable is required.`);
  return value;
};

const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): GatewayConfig => {
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  return {
    port,
    authServiceUrl: required(env, "AUTH_SERVICE_URL"),
    patientServiceUrl: required(env, "PATIENT_SERVICE_URL"),
    doctorServiceUrl: required(env, "DOCTOR_SERVICE_URL"),
    appointmentServiceUrl: required(env, "APPOINTMENT_SERVICE_URL"),
  };
};

module.exports = { loadConfig };
