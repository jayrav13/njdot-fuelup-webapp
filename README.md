# NJ Fuel Up

NJ Fuel Up is a mobile-first web app that helps NJ state employees get to key operational landmarks, such as state fueling stations and bridges, built specifically for the NJ Department of Transportation.

- **Stations**: the state fueling sites, nearest first (using the browser's location), with hours, fuel type, tap-to-call and Google Maps directions. Filter by fuel, 24-hour sites, or name/town/county.
- **Bridges**: look up any of NJDOT's 6,540 bridges by structure number (with or without leading zeros) or by name, and open it in Google Maps.
- **Maps**: an embedded Google Map of the results when a Maps API key is configured (optional).

Built with [Next.js](https://nextjs.org) (App Router, TypeScript), [Tailwind CSS](https://tailwindcss.com), and SQLite via [Drizzle ORM](https://orm.drizzle.team) + [libSQL](https://github.com/tursodatabase/libsql).

## Getting started

Requires Node.js 20.9+ (see `.nvmrc`).

```bash
git clone git@github.com:jayrav13/njdot-fuelup-webapp.git
cd njdot-fuelup-webapp
npm install
npm run db:migrate   # creates data/fuelup.db with all stations and bridges
npm run dev          # http://localhost:3000
```

Location access works on `http://localhost`; anywhere else, browsers only allow it over HTTPS.

### Google Maps (optional)

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to a key with the **Maps JavaScript API** enabled. Without it, everything works except the embedded map; "Directions" and "Go" links never need a key.

The key is sent to browsers, so in Google Cloud restrict it to **HTTP referrers** (your domains plus `localhost:3000`) and to the Maps JavaScript API. `.env.local` is gitignored; never commit a key. Optionally set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` to your own Map ID (defaults to Google's `DEMO_MAP_ID`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest (unit, data, query and API tests on an in-memory database) |
| `npm run db:migrate` | Apply pending migrations (schema + data) to `DATABASE_URL` |
| `npm run db:generate` | Generate a schema migration after editing `src/db/schema.ts` |
| `npm run db:generate-data` | Regenerate the data-import migration from `data/source/` |
| `npm run db:studio` | Browse the database in Drizzle Studio |

`DATABASE_URL` defaults to `file:data/fuelup.db`. Any libSQL URL works, including a hosted Turso database.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, migrations and a production build on every pull request.

## API

Public, read-only JSON.

```bash
# All stations, A–Z
curl http://localhost:3000/api/stations
# → { "stations": [ { "id": 5, "name": "Buena DOT", "address": "Rt. 40 near Catherine Avenue",
#       "city": "Buena", "state": "NJ", "county": "Atlantic", "hours": "7:45 AM - 3:45 PM",
#       "phone": "609-697-1136", "fuel": "Unleaded / Diesel", "unleaded": true, "diesel": true,
#       "latitude": 39.51554447, "longitude": -74.92849165 }, ... ] }

# Nearest first, with distanceMiles (straight-line). 400 if lat/lng are missing one side or invalid.
curl "http://localhost:3000/api/stations?lat=40.2206&lng=-74.7597"
# → { "origin": { "latitude": 40.2206, "longitude": -74.7597 },
#     "stations": [ { "name": "Fernwood DOT", ..., "distanceMiles": 3.23 }, ... ] }

# Bridge search by structure number or name (limit 1–100, default 50). 400 without q.
curl "http://localhost:3000/api/bridges?q=1400900"
# → { "query": "1400900", "total": 1, "bridges": [ { "structureNumber": "1400900",
#       "name": "CR 513 (GREEN POND RD) / HIBERNIA BRK", "owner": "County", "route": "9014",
#       "milepost": 48.25, "county": "Morris", "municipality": "Rockaway township",
#       "sourceLatitude": 40.56415, "sourceLongitude": -74.29367,
#       "latitude": 40.944861, "longitude": -74.493528, ... } ] }
```

## Data

The data comes from NJDOT exports dated January 2017, kept verbatim in `data/source/` and imported by the migration `drizzle/0001_import_njdot_2017_data.sql`, which `scripts/generate-data-migration.ts` generates from them. Cleanup rules live in `src/lib/source/` and are covered by tests:

- **Bridge coordinates** are packed degrees-minutes-seconds (`DD.MMSSss`, as the `ddmmss.ss` column names say): `40.453661` is 40°45'36.61" = 40.760169°. They're decoded to decimal degrees; `sourceLatitude`/`sourceLongitude` keep the originals. Seven records are already decimal and pass through; 10 records don't decode to anywhere in NJ and get `null` coordinates (no map link).
- **Structure numbers** are the official 7-character IDs (e.g. `0902153`, `043E007`) from the original export. A later re-save through Excel had stripped leading zeros and turned some IDs into scientific notation, so that copy isn't used.
- **Stations**: fixed the county for four Burlington County sites (listed as "Bordentown"), trimmed whitespace, and kept Hamilton State Police, which has an address but no coordinates.
- Apostrophes that the bridge export encoded as underscores (`BERRY_S CREEK`) are restored.

About 40 bridges have coordinates that are wrong at the source but still inside NJ; fixing those needs corrected data from NJDOT. To load a newer export, add it under `data/source/` and create a new custom migration (`npx drizzle-kit generate --custom --name=<name>`) rather than editing the existing one.

## References

To check that the site has location access in Chrome: https://support.google.com/chrome/answer/142065

## Credits

The original 2017 version was a Sinatra + AngularJS app built from [karlcoelho/sinatra-boilerplate](https://github.com/karlcoelho/sinatra-boilerplate).
