import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { afterAll, afterEach, beforeAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-access-token-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret";

let replicaSet: MongoMemoryReplSet;

beforeAll(async () => {
  replicaSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });

  await mongoose.connect(replicaSet.getUri());
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await replicaSet.stop();
});
