import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    env: { NODE_ENV: "test" },
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
  },
});
