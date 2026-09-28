import { asc, count, like, or, sql } from "drizzle-orm";
import { structureNumberKey } from "@/lib/structure-number";
import { db as defaultDb, type Database } from "./index";
import { bridges, stations } from "./schema";

export const MAX_QUERY_LENGTH = 100;
export const DEFAULT_BRIDGE_LIMIT = 50;
export const MAX_BRIDGE_LIMIT = 100;

export async function listStations(db: Database = defaultDb) {
  return db.select().from(stations).orderBy(asc(stations.name));
}

export async function countRecords(db: Database = defaultDb) {
  const [[stationCount], [bridgeCount]] = await Promise.all([
    db.select({ n: count() }).from(stations),
    db.select({ n: count() }).from(bridges),
  ]);
  return { stations: stationCount.n, bridges: bridgeCount.n };
}

/** Escape LIKE wildcards so user input matches literally (ESCAPE '\'). */
const likeLiteral = (value: string) => value.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Search bridges by structure number or name. Structure numbers match
 * regardless of case or leading zeros ("902153" finds "0902153"); names match
 * case-insensitively anywhere in the text. Exact structure-number matches come
 * first, then structure-number prefixes, then everything else by number.
 */
export async function searchBridges(
  query: string,
  { limit = DEFAULT_BRIDGE_LIMIT, db = defaultDb }: { limit?: number; db?: Database } = {},
) {
  const q = query.trim().slice(0, MAX_QUERY_LENGTH);
  if (q === "") return { total: 0, bridges: [] };

  const key = structureNumberKey(q);
  const namePattern = `%${likeLiteral(q)}%`;
  const conditions = [sql`${bridges.name} like ${namePattern} escape '\\'`];
  if (key !== "") conditions.push(like(bridges.structureKey, `%${key}%`));
  const where = or(...conditions);

  const rank = sql`case
    when ${bridges.structureKey} = ${key} then 0
    when ${bridges.structureKey} like ${`${key}%`} then 1
    else 2 end`;

  const [[{ total }], rows] = await Promise.all([
    db.select({ total: count() }).from(bridges).where(where),
    db
      .select()
      .from(bridges)
      .where(where)
      .orderBy(rank, asc(bridges.structureNumber))
      .limit(limit),
  ]);
  return { total, bridges: rows };
}
