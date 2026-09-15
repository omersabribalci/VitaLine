const mongoose = require("mongoose");

let ready = false;

mongoose.connection.on("connected", () => {
  ready = true;
});
mongoose.connection.on("disconnected", () => {
  ready = false;
});
mongoose.connection.on("error", () => {
  ready = false;
});

const connectDatabase = async (mongodbUri: string) => {
  await mongoose.connect(mongodbUri);
  ready = true;
  console.info(
    JSON.stringify({
      service: "doctor-service",
      message: "MongoDB connection established.",
    }),
  );
};

const disconnectDatabase = async () => {
  ready = false;
  await mongoose.disconnect();
};

const isDatabaseReady = () => ready && mongoose.connection.readyState === 1;

module.exports = { connectDatabase, disconnectDatabase, isDatabaseReady };
