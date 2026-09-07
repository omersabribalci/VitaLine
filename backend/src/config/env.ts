const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`The ${name} environment variable is not defined.`);
  }

  return value;
};

const getPort = (): number => {
  const rawPort = process.env.PORT ?? "5000";
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return port;
};

const validateServerEnv = (): void => {
  getRequiredEnv("MONGODB_URI");
  getRequiredEnv("ACCESS_TOKEN_SECRET");
  getRequiredEnv("REFRESH_TOKEN_SECRET");
};

export { getPort, getRequiredEnv, validateServerEnv };
