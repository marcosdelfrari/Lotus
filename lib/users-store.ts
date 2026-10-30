import { adminEmail, roleForEmail } from "@/lib/access-code";
import {
  ensureClientOrganization,
  syncCompanyPlanWithUser,
} from "@/lib/client-companies-store";
import type { User } from "@/lib/generated/analytics/client";
import { analyticsPrisma as prisma } from "@/lib/analytics-db";
import { hashPassword, verifyPassword } from "@/lib/password";
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }
  return null;
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

export async function createClient(input: {
  name: string;
  email: string;
  password?: string;
}) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com esse e-mail." } as const;
  }

  const role: Role = roleForEmail(email);
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      role,
      planActive: role === "admin",
      ...(passwordHash ? { passwordHash } : {}),
    },
  });
  return { account: toAccount(user) } as const;
}

export async function registerWithPassword(input: {
  name: string;
  email: string;
  password: string;
}) {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (!name) return { error: "Informe seu nome." } as const;
  if (!email || !email.includes("@")) {
    return { error: "Informe um e-mail válido." } as const;
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) return { error: passwordError } as const;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.passwordHash) {
      return { error: "Já existe uma conta com esse e-mail. Entre com e-mail e senha." } as const;
    }
    return {
      error: "Já existe uma conta com esse e-mail. Entre com o Google.",
    } as const;
  }

  return createClient({
    name,
    email,
    password: input.password,
  });
}

export async function authenticateWithPassword(input: {
  email: string;
  password: string;
}) {
  const email = normalizeEmail(input.email);
  if (!email || !input.password) {
    return { error: "Informe e-mail e senha." } as const;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "E-mail ou senha incorretos." } as const;
  }
  if (!user.passwordHash) {
    return {
      error: "Esta conta entra com Google. Use o botão Entrar com Google.",
    } as const;
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    return { error: "E-mail ou senha incorretos." } as const;
  }

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
