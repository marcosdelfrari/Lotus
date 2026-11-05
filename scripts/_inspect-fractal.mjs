import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
const u = new URL(process.env.DATABASE_URL);
u.pathname = "/fractal";
const c = new pg.Client({ connectionString: u.toString() });
await c.connect();
const schemas = await c.query(
  "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog','information_schema') ORDER BY 1",
);
console.log("schemas:", schemas.rows.map((r) => r.schema_name).join(", "));
const tables = await c.query(
  "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type='BASE TABLE' ORDER BY 1,2",
);
for (const r of tables.rows) console.log(`${r.table_schema}.${r.table_name}`);
try {
  const mig = await c.query(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY started_at",
  );
  console.log("applied migrations:", mig.rows.length);
  mig.rows.forEach((r) => console.log(" ", r.migration_name));
} catch {
  console.log("no _prisma_migrations");
}
const users = await c.query("SELECT count(*)::int AS c FROM dbo.cad_usuario").catch(() => null);
if (users) console.log("dbo.cad_usuario rows:", users.rows[0].c);
await c.end();
