import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/analytics/client";
import { pgConnectionString } from "@/lib/pg-connection";

const globalForAnalytics = globalThis as unknown as {
  analyticsPrisma: PrismaClient | undefined;
  analyticsPool: Pool | undefined;
};

function createAnalyticsClient() {
  const raw = process.env.DATABASE_URL_ANALYTICS;
  if (!raw) {
    throw new Error("DATABASE_URL_ANALYTICS não está definida.");
  }
  const connectionString = pgConnectionString(raw);
  const pool = globalForAnalytics.analyticsPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalForAnalytics.analyticsPool = pool;
  }
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

function getAnalyticsClient() {
  if (!globalForAnalytics.analyticsPrisma) {
    globalForAnalytics.analyticsPrisma = createAnalyticsClient();
  }
  return globalForAnalytics.analyticsPrisma;
}

export const analyticsPrisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getAnalyticsClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
