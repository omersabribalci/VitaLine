require("dotenv/config");

const app = require("./src/app.js");
const { connectDatabase } = require("./src/config/database.js");
const { loadConfig } = require("./src/config/env.js");
const { initializeAppointmentStorage } = require("./src/services/initializeAppointmentStorage.js");
const { restartAppointmentStatusJob } = require("./src/jobs/appointmentStatusJob.js");

const startServer = async () => {
  const config = loadConfig();
  await connectDatabase(config.mongodbUri);
  await initializeAppointmentStorage();
  await restartAppointmentStatusJob();

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`Appointment Service ${config.port} portunda çalışıyor`);
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`API: http://localhost:${config.port}/api/appointments`);
  });
};

startServer().catch((error: unknown) => {
  console.error(
    "Appointment Service başlatılamadı:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
