type DoctorServiceConfig = {
  port: number;
  mongodbUri: string;
  internalApiKey: string;
  authServiceUrl: string;
  appointmentServiceUrl: string;
  accessTokenSecret: string;
};

const required = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`${name} environment variable is required.`);
  return value;
};

const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): DoctorServiceConfig => {
  const port = Number(env.PORT || 5003);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  return {
    port,
    mongodbUri: required(env, "MONGODB_URI"),
    internalApiKey: required(env, "INTERNAL_API_KEY"),
    authServiceUrl: required(env, "AUTH_SERVICE_URL"),
    appointmentServiceUrl: required(env, "APPOINTMENT_SERVICE_URL"),
    accessTokenSecret: required(env, "ACCESS_TOKEN_SECRET"),
  };
};

module.exports = { loadConfig };
