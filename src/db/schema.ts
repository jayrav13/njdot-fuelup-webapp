import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const stations = sqliteTable("stations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state").notNull().default("NJ"),
  county: text("county"),
  /** Free text, e.g. "24 Hours" or "7:45 AM - 3:45 PM"; may span two lines. */
  hours: text("hours"),
  phone: text("phone"),
  /** Fuel as listed by NJDOT, e.g. "Unleaded / Diesel" or "Non-Automated". */
  fuel: text("fuel"),
  unleaded: integer("unleaded", { mode: "boolean" }).notNull().default(false),
  diesel: integer("diesel", { mode: "boolean" }).notNull().default(false),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

export const bridges = sqliteTable(
  "bridges",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Official NJDOT structure number, 7 characters, e.g. "0902153". */
    structureNumber: text("structure_number").notNull().unique(),
    /** Search key: uppercase, leading zeros dropped (see structureNumberKey). */
    structureKey: text("structure_key").notNull(),
    name: text("name").notNull(),
    owner: text("owner"),
    route: text("route"),
    milepost: real("milepost"),
    county: text("county"),
    municipality: text("municipality"),
    /** Coordinates exactly as in the source: packed DD.MMSSss for most records. */
    sourceLatitude: real("source_latitude"),
    sourceLongitude: real("source_longitude"),
    /** Decoded decimal degrees; null when the source doesn't decode to NJ. */
    latitude: real("latitude"),
    longitude: real("longitude"),
  },
  (table) => [index("bridges_structure_key_idx").on(table.structureKey)],
);

export type Station = typeof stations.$inferSelect;
export type Bridge = typeof bridges.$inferSelect;
