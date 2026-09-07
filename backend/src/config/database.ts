import mongoose from "mongoose";
const logger = require("../middleware/logger");
import { getRequiredEnv } from "./env";

const connectDatabase = async () => {
  const mongoUri = getRequiredEnv("MONGODB_URI");

  await mongoose.connect(mongoUri);

  logger.info("MongoDB connection established!");
};

export = connectDatabase;
