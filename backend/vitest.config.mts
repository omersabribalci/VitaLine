import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup/database.ts"],
    pool: "threads",
    maxWorkers: 1,
    isolate: false,
    fileParallelism: false,
    hookTimeout: 120_000,
    testTimeout: 60_000,
  },
});
