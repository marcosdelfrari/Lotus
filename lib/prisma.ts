import { PrismaPg } from "@prisma/adapter-pg";
import type { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { createAppPool, disposePool } from "@/lib/pg-pool";

/** Bump quando o schema Lotus mudar — força novo PrismaClient no hot reload. */
const PRISMA_SCHEMA_TOKEN = "20261022180000_marketing_plans";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  prismaSchemaToken?: string;
};

function hasCurrentModels(client: PrismaClient) {
  return (
    typeof client.trafficProposal?.findFirst === "function" &&
    typeof client.interest?.findFirst === "function" &&
    typeof client.marketingPlan?.findFirst === "function"
  );
}

async function disposeLotusClient() {
  const client = globalForPrisma.prisma;
  globalForPrisma.prisma = undefined;
  if (client) {
    try {
      await client.$disconnect();
    } catch {
      // ignore
    }
  }
  const pool = globalForPrisma.pgPool;
  globalForPrisma.pgPool = undefined;
  await disposePool(pool);
}

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const pool = createAppPool(raw, "lotus");
  globalForPrisma.pgPool = pool;
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

function getPrismaClient() {
  const staleToken = globalForPrisma.prismaSchemaToken !== PRISMA_SCHEMA_TOKEN;
  if (
    !globalForPrisma.prisma ||
    staleToken ||
    !hasCurrentModels(globalForPrisma.prisma)
  ) {
    const oldClient = globalForPrisma.prisma;
    const oldPool = globalForPrisma.pgPool;
    globalForPrisma.prisma = undefined;
    globalForPrisma.pgPool = undefined;
    globalForPrisma.prismaSchemaToken = PRISMA_SCHEMA_TOKEN;
    globalForPrisma.prisma = createPrismaClient();
    if (oldClient) {
      void oldClient.$disconnect().catch(() => undefined);
    }
    void disposePool(oldPool);
  }
  return globalForPrisma.prisma;
}

/** Recria o client se o Postgres encerrou a conexão (comum em hot reload / idle). */
export async function resetLotusPrisma() {
  await disposeLotusClient();
  globalForPrisma.prismaSchemaToken = PRISMA_SCHEMA_TOKEN;
  globalForPrisma.prisma = createPrismaClient();
  return globalForPrisma.prisma;
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

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    // Model delegates (interest, trafficProposal, …): wrap methods for one reconnect retry.
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
              const fresh = await resetLotusPrisma();
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
