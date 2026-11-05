import pg from "pg";

const sources = [
  {
    label: "prisma-cloud-fractal-api-env",
    url: "postgres://8a8d988881c6849378f32582063a598c9b414bd268490c78e060d65aa833ce98:sk_icC3FY6YXWF4k4L8jM9Xi@db.prisma.io:5432/postgres?sslmode=require",
  },
];

for (const { label, url } of sources) {
  console.log(`\n=== ${label} ===`);
  const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    const tables = [
      "public.traffic_proposals",
      "public.proposal_billing_items",
      "public.marketing_plans",
      "dbo.cad_usuario",
      "public.users",
    ];
    for (const t of tables) {
      try {
        const r = await c.query(`SELECT count(*)::int AS c FROM ${t}`);
        console.log(`  ${t}: ${r.rows[0].c}`);
      } catch (e) {
        console.log(`  ${t}: ${e.message.split("\n")[0]}`);
      }
    }
  } catch (e) {
    console.log("  connect failed:", e.message.split("\n")[0]);
  } finally {
    await c.end().catch(() => undefined);
  }
}
