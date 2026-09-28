import { beforeAll } from "vitest";
import { db } from "@/db";
import { runMigrations } from "@/db/migrate";

/**
 * Migrate the shared `db` (an in-memory SQLite database under Vitest, per
 * vitest.config.ts) before the tests in the calling file run. This applies the
 * real migrations, including the full data import.
 */
export function migrateTestDatabase() {
  beforeAll(async () => {
    if (process.env.DATABASE_URL !== ":memory:") {
      throw new Error("Refusing to run DB tests against a non-memory database");
    }
    await runMigrations(db);
  });
  return db;
}
