import path from "node:path";
import { migrate } from "drizzle-orm/libsql/migrator";
import type { Database } from "./index";

export const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

/** Apply schema and data migrations from drizzle/ that haven't run yet. */
export async function runMigrations(database: Database) {
  await migrate(database, { migrationsFolder: MIGRATIONS_FOLDER });
}
