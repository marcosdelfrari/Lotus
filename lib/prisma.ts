import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { pgConnectionString } from "@/lib/pg-connection";

/** Bump quando o schema Lotus mudar — força novo PrismaClient no hot reload. */
const PRISMA_SCHEMA_TOKEN = "20261019200000_proposal_client_email";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  prismaSchemaToken?: string;
};

function createPrismaClient() {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL não está definida.");
  }
  const connectionString = pgConnectionString(raw);
  const pool = globalForPrisma.pgPool ?? new Pool({ connectionString });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pgPool = pool;
  }
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function hasCurrentModels(client: PrismaClient) {
  return (
    typeof client.trafficProposal?.findFirst === "function" &&
    typeof client.interest?.findFirst === "function"
  );
}

function getPrismaClient() {
  const staleToken = globalForPrisma.prismaSchemaToken !== PRISMA_SCHEMA_TOKEN;
  if (
    !globalForPrisma.prisma ||
    staleToken ||
    !hasCurrentModels(globalForPrisma.prisma)
  ) {
    globalForPrisma.prismaSchemaToken = PRISMA_SCHEMA_TOKEN;
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
