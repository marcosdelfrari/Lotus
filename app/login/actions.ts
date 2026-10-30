"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  destinationAfterLogin,
  safeReturnPath,
} from "@/lib/auth-redirect";
import {
  sessionCookie,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";
import {
  authenticateWithPassword,
  checkEmailForPasswordLogin,
  ensureAdminFromEnv,
  registerWithPassword,
  setupPasswordAndLogin,
} from "@/lib/users-store";

export type AuthFormState = {
  error?: string;
  ok?: boolean;
} | null;

export type CheckLoginEmailState = {
  error?: string;
  verifiedEmail?: string;
  needsPasswordSetup?: boolean;
} | null;

async function establishSession(account: {
  id: string;
  role: "admin" | "client";
  name: string;
  email: string;
}) {
  const token = await signSession({
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
  });
  const jar = await cookies();
  jar.set(sessionCookie, token, sessionCookieOptions());
}

export async function logout() {
  const jar = await cookies();
  jar.delete(sessionCookie);
  redirect("/");
}

export async function checkLoginEmailAction(
  _prev: CheckLoginEmailState,
  formData: FormData,
): Promise<CheckLoginEmailState> {
  await ensureAdminFromEnv();

  const email = String(formData.get("email") ?? "");
  const result = await checkEmailForPasswordLogin(email);
  if ("error" in result) return { error: result.error };

  return {
    verifiedEmail: result.email,
    needsPasswordSetup: result.needsPasswordSetup,
  };
}

export async function setupPasswordLoginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  await ensureAdminFromEnv();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const next = safeReturnPath(String(formData.get("next") ?? ""));

  const result = await setupPasswordAndLogin({
    email,
    password,
    confirmPassword,
  });
  if ("error" in result) return { error: result.error };

  await establishSession(result.account);
  redirect(await destinationAfterLogin(result.account, next));
}

export async function loginWithPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  await ensureAdminFromEnv();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeReturnPath(String(formData.get("next") ?? ""));

  const result = await authenticateWithPassword({ email, password });
  if ("error" in result) return { error: result.error };

  await establishSession(result.account);
  redirect(await destinationAfterLogin(result.account, next));
}

export async function registerWithPasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  await ensureAdminFromEnv();

  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const next = safeReturnPath(String(formData.get("next") ?? ""));

  if (password !== confirm) {
    return { error: "As senhas não coincidem." };
  }

  const result = await registerWithPassword({ name, email, password });
  if ("error" in result) return { error: result.error };

  await establishSession(result.account);
  redirect(await destinationAfterLogin(result.account, next));
}
