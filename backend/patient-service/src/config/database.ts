const mongoose = require("mongoose");

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (
  mongodbUri: string,
  attempt: number = 1,
): Promise<void> => {
  try {
    await mongoose.connect(mongodbUri);
  } catch (error: unknown) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }

    console.warn(
      `Patient Service MongoDB bağlantısı başarısız (deneme ${attempt}/${MAX_RETRIES}), ${RETRY_DELAY_MS}ms sonra tekrar denenecek...`,
    );
    await sleep(RETRY_DELAY_MS);
    return connectWithRetry(mongodbUri, attempt + 1);
  }
};

const connectDatabase = async (mongodbUri: string) => {
  await connectWithRetry(mongodbUri);
  console.log("Patient Service MongoDB bağlantısı kuruldu");
};

const disconnectDatabase = () => mongoose.disconnect();

const isDatabaseReady = () => mongoose.connection.readyState === 1;

module.exports = { connectDatabase, disconnectDatabase, isDatabaseReady };
