require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const logger = require("./src/middleware/logger");
const getErrorMessage = require("./src/utils/getErrorMessage");
const { getPort, validateServerEnv } = require("./src/config/env");
const { ensureAdminExists } = require("./src/scripts/seedAdmin");
const {
  startAppointmentStatusJob,
} = require("./src/jobs/appointmentStatusJob");

const PORT = getPort();

const startServer = async () => {
  try {
    validateServerEnv();
    await connectDatabase();
    await ensureAdminExists();
    await startAppointmentStatusJob();

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start the application: ${getErrorMessage(error)}`);
    process.exit(1);
  }
};

startServer();
