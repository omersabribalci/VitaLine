require("dotenv/config");

const app = require("./src/app.js");
const { connectDatabase } = require("./src/config/database.js");
const { loadConfig } = require("./src/config/env.js");
const { ensureAdminExists } = require("./src/startup/ensureAdmin.js");

const startServer = async () => {
  const config = loadConfig();
  await connectDatabase(config.mongodbUri);
  await ensureAdminExists(config.admin);


  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Auth Service ${config.port} portunda çalışıyor`);
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`API: http://localhost:${config.port}/api/auth`);
  });
};

startServer().catch((error: unknown) => {
  console.error(
    "Auth Service başlatılamadı:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
