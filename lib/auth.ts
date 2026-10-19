import { cookies } from "next/headers";
import { hasActivePlan } from "@/lib/plan";
import { readSession, sessionCookie } from "@/lib/session";
import type { Session } from "@/lib/types";
import { findAccountById } from "@/lib/users-store";

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const session = await readSession(jar.get(sessionCookie)?.value);
  if (!session) return null;
  const account = await findAccountById(session.userId);
  if (!account) return null;
  return {
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    planActive: hasActivePlan(account),
  };
}
