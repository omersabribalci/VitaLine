const mongoose = require("mongoose");

const connectDatabase = async (mongodbUri: string) => {
  await mongoose.connect(mongodbUri);
  console.info(
    JSON.stringify({
      service: "auth-service",
      message: "MongoDB connection established.",
    }),
  );
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDatabase, disconnectDatabase, isDatabaseReady };
