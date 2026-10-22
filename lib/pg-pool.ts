import { Pool, type PoolConfig } from "pg";
import { pgConnectionString } from "@/lib/pg-connection";

/** Pool estável para Prisma Postgres (db.prisma.io): keepalive + descarte de idle. */
export function createAppPool(rawUrl: string, label: string): Pool {
  const connectionString = pgConnectionString(rawUrl);
  const config: PoolConfig = {
    connectionString,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    allowExitOnIdle: false,
  };
  const pool = new Pool(config);
  pool.on("error", (err) => {
    console.error(`[pg:${label}] pool error:`, err.message);
  });
  return pool;
}

export async function disposePool(pool: Pool | undefined) {
  if (!pool) return;
  try {
    await pool.end();
  } catch {
    // pool já fechado
  }
}
