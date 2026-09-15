type AppointmentServiceConfig = {
  port: number;
  mongodbUri: string;
  authServiceUrl: string;
  doctorServiceUrl: string;
  patientServiceUrl: string;
  internalApiKey: string;
  accessTokenSecret: string;
};

const required = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`${name} environment variable is required.`);
  return value;
};

const serviceUrl = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = required(env, name);
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https.`);
  }
  return value.replace(/\/$/, "");
};

const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): AppointmentServiceConfig => {
  const port = Number(env.PORT || 5004);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port.");
  }

  return {
    port,
    mongodbUri: required(env, "MONGODB_URI"),
    authServiceUrl: serviceUrl(env, "AUTH_SERVICE_URL"),
    doctorServiceUrl: serviceUrl(env, "DOCTOR_SERVICE_URL"),
    patientServiceUrl: serviceUrl(env, "PATIENT_SERVICE_URL"),
    internalApiKey: required(env, "INTERNAL_API_KEY"),
    accessTokenSecret: required(env, "ACCESS_TOKEN_SECRET"),
  };
};

module.exports = { loadConfig };
