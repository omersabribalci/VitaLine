const mongoose = require("mongoose");
const logger = require("../middleware/logger");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri)
    throw new Error("The MONGODB_URI environment variable is not defined.");

  await mongoose.connect(mongoUri);

  logger.info("MongoDB connection established!");
};

module.exports = connectDatabase;
