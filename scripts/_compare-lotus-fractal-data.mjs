import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });
config();

async function inspectDb(name, connectionString) {
  const c = new pg.Client({ connectionString });
  try {
    await c.connect();
  } catch (e) {
    console.log(`\n=== ${name} ===`);
    console.log("  (não conectou:", e.message, ")");
    return;
  }
  console.log(`\n=== ${name} ===`);
  const tables = [
    ["public", "traffic_proposals"],
    ["public", "proposal_billing_items"],
    ["public", "marketing_plans"],
    ["public", "interessados"],
    ["dbo", "cad_usuario"],
    ["leads", "mov_submissao"],
  ];
  for (const [schema, table] of tables) {
    try {
      const r = await c.query(
        `SELECT count(*)::int AS c FROM ${schema}.${table}`,
      );
      console.log(`  ${schema}.${table}: ${r.rows[0].c} linhas`);
    } catch (e) {
      console.log(`  ${schema}.${table}: (ausente ou erro)`);
    }
  }
  try {
    const sample = await c.query(
      `SELECT id, status, company_name, created_at FROM public.traffic_proposals ORDER BY created_at DESC LIMIT 3`,
    );
    if (sample.rows.length) {
      console.log("  amostra propostas:", JSON.stringify(sample.rows, null, 2));
    }
  } catch {
    // ignore
  }
  await c.end();
}

const base = process.env.DATABASE_URL;
if (!base) {
  console.error("DATABASE_URL ausente");
  process.exit(1);
}

await inspectDb("DATABASE_URL atual", base);

for (const dbName of ["fractal", "lotus", "postgres"]) {
  const u = new URL(base);
  u.pathname = `/${dbName}`;
  await inspectDb(`banco /${dbName}`, u.toString());
}
