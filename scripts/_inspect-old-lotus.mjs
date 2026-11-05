import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
const url = process.env.POSTGRES_URL;
if (!url) {
  console.log("no POSTGRES_URL");
  process.exit(0);
}
const c = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const schemas = await c.query(
  "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema') ORDER BY 1",
);
console.log("schemas:", schemas.rows.map((r) => r.schema_name).join(", "));
const tables = await c.query(
  "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type='BASE TABLE' ORDER BY 1,2",
);
for (const r of tables.rows) console.log(`${r.table_schema}.${r.table_name}`);
await c.end();
