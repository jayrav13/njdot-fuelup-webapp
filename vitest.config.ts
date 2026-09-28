import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Each test file gets its own in-memory database (see src/test/db.ts).
    env: { DATABASE_URL: ":memory:" },
  },
});
