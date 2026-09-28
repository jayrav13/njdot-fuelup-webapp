/**
 * Create or update the SQLite database (DATABASE_URL, default
 * file:data/fuelup.db) by applying every pending migration in drizzle/,
 * including the data import. Run with `npm run db:migrate`.
 */
import { mkdirSync } from "node:fs";
import { db, DEFAULT_DATABASE_URL } from "../src/db";
import { countRecords } from "../src/db/queries";
import { runMigrations } from "../src/db/migrate";

const url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
if (url === DEFAULT_DATABASE_URL) mkdirSync("data", { recursive: true });

await runMigrations(db);
const counts = await countRecords(db);
console.log(`Migrated ${url}: ${counts.stations} stations, ${counts.bridges} bridges.`);
