const mongoose = require("mongoose");

let ready = false;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

mongoose.connection.on("connected", () => {
  ready = true;
});
mongoose.connection.on("disconnected", () => {
  ready = false;
});
mongoose.connection.on("error", () => {
  ready = false;
});

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
      JSON.stringify({
        service: "appointment-service",
        message: `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed, retrying in ${RETRY_DELAY_MS}ms.`,
      }),
    );
    await sleep(RETRY_DELAY_MS);
    return connectWithRetry(mongodbUri, attempt + 1);
  }
};

const connectDatabase = async (mongodbUri: string): Promise<void> => {
  await connectWithRetry(mongodbUri);
  ready = true;
  console.info(
    JSON.stringify({
      service: "appointment-service",
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
