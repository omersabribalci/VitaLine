const mongoose = require("mongoose");

const connectDatabase = async (mongodbUri: string) => {
  await mongoose.connect(mongodbUri);
  console.log("Patient Service MongoDB bağlantısı kuruldu");
};

const disconnectDatabase = () => mongoose.disconnect();

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDatabase, disconnectDatabase, isDatabaseReady };
