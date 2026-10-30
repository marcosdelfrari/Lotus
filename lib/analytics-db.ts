import { PrismaPg } from "@prisma/adapter-pg";
import type { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/analytics/client";
import { createAppPool, disposePool } from "@/lib/pg-pool";

/** Bump quando o espelho Analytics mudar — força novo client no hot reload. */
const ANALYTICS_SCHEMA_TOKEN = "20261030120000_user_password_hash";

const globalForAnalytics = globalThis as unknown as {
  analyticsPrisma: PrismaClient | undefined;
  analyticsPool: Pool | undefined;
  analyticsSchemaToken?: string;
};

function hasCurrentModels(client: PrismaClient) {
  return (
    typeof client.user?.findFirst === "function" &&
    typeof client.company?.findFirst === "function" &&
    typeof client.loginOtp?.findFirst === "function"
  );
}

async function disposeAnalyticsClient() {
  const client = globalForAnalytics.analyticsPrisma;
  globalForAnalytics.analyticsPrisma = undefined;
  if (client) {
    try {
      await client.$disconnect();
    } catch {
      // ignore
    }
  }
  const pool = globalForAnalytics.analyticsPool;
  globalForAnalytics.analyticsPool = undefined;
  await disposePool(pool);
}

function createAnalyticsClient() {
  const raw = process.env.DATABASE_URL_ANALYTICS;
  if (!raw) {
    throw new Error("DATABASE_URL_ANALYTICS não está definida.");
  }
  const pool = createAppPool(raw, "analytics");
  globalForAnalytics.analyticsPool = pool;
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

function getAnalyticsClient() {
  const staleToken =
    globalForAnalytics.analyticsSchemaToken !== ANALYTICS_SCHEMA_TOKEN;
  if (
    !globalForAnalytics.analyticsPrisma ||
    staleToken ||
    !hasCurrentModels(globalForAnalytics.analyticsPrisma)
  ) {
    const oldClient = globalForAnalytics.analyticsPrisma;
    const oldPool = globalForAnalytics.analyticsPool;
    globalForAnalytics.analyticsPrisma = undefined;
    globalForAnalytics.analyticsPool = undefined;
    globalForAnalytics.analyticsSchemaToken = ANALYTICS_SCHEMA_TOKEN;
    globalForAnalytics.analyticsPrisma = createAnalyticsClient();
    if (oldClient) {
      void oldClient.$disconnect().catch(() => undefined);
    }
    void disposePool(oldPool);
  }
  return globalForAnalytics.analyticsPrisma;
}

export async function resetAnalyticsPrisma() {
  await disposeAnalyticsClient();
  globalForAnalytics.analyticsSchemaToken = ANALYTICS_SCHEMA_TOKEN;
  globalForAnalytics.analyticsPrisma = createAnalyticsClient();
  return globalForAnalytics.analyticsPrisma;
}

function isClosedConnectionError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message
      : "";
  return (
    message.includes("Server has closed the connection") ||
    message.includes("Connection terminated") ||
    message.includes("ECONNRESET") ||
    message.includes("connection is closed")
  );
}

export const analyticsPrisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getAnalyticsClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    if (value && typeof value === "object") {
      return new Proxy(value, {
        get(model, modelProp, modelReceiver) {
          const method = Reflect.get(model, modelProp, modelReceiver);
          if (typeof method !== "function") return method;
          return async (...args: unknown[]) => {
            try {
              return await method.apply(model, args);
            } catch (error) {
              if (!isClosedConnectionError(error)) throw error;
              const fresh = await resetAnalyticsPrisma();
              const freshModel = Reflect.get(
                fresh,
                prop,
                fresh,
              ) as Record<string | symbol, unknown>;
              const retry = freshModel?.[modelProp];
              if (typeof retry !== "function") throw error;
              return retry.apply(freshModel, args);
            }
          };
        },
      });
    }
    return value;
  },
});
