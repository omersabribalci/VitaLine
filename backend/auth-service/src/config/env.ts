type AuthServiceConfig = {
  port: number;
  mongodbUri: string;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  patientServiceUrl: string;
  internalApiKey: string;
  admin: {
    name: string;
    email: string;
    password: string;
    phone: string;
    image: string;
  };
};

// "Eğer bir servis eksik konfigürasyonla çalışacaksa, hiç ayağa kalkmasın ve hemen çöksün (Fail-Fast)."
// uygulamanın eksik konfigürasyonla çalışmasını engeller.

const required = (env: NodeJS.ProcessEnv, name: string): string => {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
};

const productionSecret = (
  env: NodeJS.ProcessEnv,
  name: string,
  minimumLength: number,
): string => {
  const value = required(env, name);

  if (env.NODE_ENV !== "production") {
    return value;
  }

  if (value.length < minimumLength) {
    throw new Error(
      `${name} must be at least ${minimumLength} characters in production.`,
    );
  }

  if (value.toLowerCase().includes("replace-with")) {
    throw new Error(`${name} still contains an example placeholder.`);
  }

  return value;
};

const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): AuthServiceConfig => {
  const mongodbUri = required(env, "MONGODB_URI");

  const port = Number(env.PORT || 5001);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port.");
  }

  const accessTokenSecret = productionSecret(env, "ACCESS_TOKEN_SECRET", 32);
  const refreshTokenSecret = productionSecret(env, "REFRESH_TOKEN_SECRET", 32);
  const internalApiKey = productionSecret(env, "INTERNAL_API_KEY", 32);
  const adminPassword = productionSecret(env, "ADMIN_PASSWORD", 12);

  if (env.NODE_ENV === "production" && accessTokenSecret === refreshTokenSecret) {
    throw new Error(
      "ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different.",
    );
  }

  return {
    port,
    mongodbUri,
    accessTokenSecret,
    refreshTokenSecret,
    patientServiceUrl: required(env, "PATIENT_SERVICE_URL"),
    internalApiKey,
    admin: {
      name: required(env, "ADMIN_NAME"),
      email: required(env, "ADMIN_EMAIL"),
      password: adminPassword,
      phone: required(env, "ADMIN_PHONE"),
      image: env.ADMIN_IMAGE || "",
    },
  };
};

module.exports = { loadConfig };
