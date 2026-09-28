import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const DEFAULT_DATABASE_URL = "file:data/fuelup.db";

function createDb() {
  const client = createClient({ url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

// Reuse one client across hot reloads in development.
const globalForDb = globalThis as unknown as { fuelUpDb?: Database };

export const db: Database = globalForDb.fuelUpDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.fuelUpDb = db;
