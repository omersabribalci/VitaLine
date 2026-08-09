require("dotenv").config();
const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const logger = require("./src/middleware/logger");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start the application: ${error.message}`);
    process.exit(1);
  }
};

startServer();
