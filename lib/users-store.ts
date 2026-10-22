import { adminEmail, roleForEmail } from "@/lib/access-code";
import {
  ensureClientOrganization,
  syncCompanyPlanWithUser,
} from "@/lib/client-companies-store";
import type { User } from "@/lib/generated/analytics/client";
import { analyticsPrisma as prisma } from "@/lib/analytics-db";
import type { Account, Role } from "@/lib/types";

function toAccount(user: User): Account {
  const role = roleForEmail(user.email);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    planActive: role === "admin" ? true : user.planActive,
  };
}

async function ensureAdminUser() {
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Administrador",
      role: "admin",
      planActive: true,
    },
    update: {
      name: "Administrador",
      role: "admin",
      planActive: true,
    },
  });
}

export async function ensureAdminFromEnv() {
  await ensureAdminUser();
}

export async function findAccountByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  return user ? toAccount(user) : null;
}

export async function findAccountById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toAccount(user) : null;
}

export async function listClients() {
  await ensureAdminUser();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return users.map(toAccount).filter((user) => user.role === "client");
}

export async function createClient(input: { name: string; email: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." } as const;
  }

  const role: Role = roleForEmail(email);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      role,
      planActive: role === "admin",
    },
  });
  return { account: toAccount(user) } as const;
}

export async function setClientPlanActive(id: string, planActive: boolean) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || roleForEmail(user.email) !== "client") {
    return { error: "Cliente não encontrado." } as const;
  }
  const updated = await prisma.user.update({
    where: { id },
    data: { planActive },
  });
  await syncCompanyPlanWithUser(id, planActive);
  return { account: toAccount(updated) } as const;
}

/** Conta do Analytics que deve receber o plano Pro (e-mail do login tem prioridade). */
export async function resolveAnalyticsClientId(input: {
  email: string;
  preferredIds: string[];
}) {
  const normalized = input.email.trim().toLowerCase();
  if (normalized) {
    const byEmail = await prisma.user.findUnique({ where: { email: normalized } });
    if (byEmail && roleForEmail(byEmail.email) === "client") {
      return byEmail.id;
    }
  }

  for (const id of input.preferredIds) {
    if (!id) continue;
    const user = await prisma.user.findUnique({ where: { id } });
    if (user && roleForEmail(user.email) === "client") {
      return user.id;
    }
  }

  return null;
}

export async function activateClientProPlan(input: {
  email: string;
  preferredIds: string[];
}) {
  const clientId = await resolveAnalyticsClientId(input);
  if (!clientId) {
    return { error: "Conta do Analytics não encontrada para ativar o plano Pro." } as const;
  }
  await ensureClientOrganization(clientId);
  const plan = await setClientPlanActive(clientId, true);
  if ("error" in plan) {
    return { error: plan.error } as const;
  }
  return { account: plan.account, clientId } as const;
}
