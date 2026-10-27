"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  generateLoginCode,
  saveLoginOtp,
  verifyLoginOtp,
} from "@/lib/login-otp";
import { mailConfigured, sendLoginCodeEmail } from "@/lib/mail";
import { getLatestProposalForUser } from "@/lib/proposals-store";
import { sessionCookie, sessionCookieOptions, signSession } from "@/lib/session";
import { createClient, ensureAdminFromEnv, findAccountByEmail } from "@/lib/users-store";

export type LoginCodeFormState = {
  error?: string;
  sent?: boolean;
  email?: string;
} | null;

function normalizeEmail(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/propostas";
  if (!value.startsWith("/") || value.startsWith("//")) return "/propostas";
  return value;
}

async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) {
    return (
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
  }
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function requestLoginCode(
  _prev: LoginCodeFormState,
  formData: FormData,
): Promise<LoginCodeFormState> {
  const email = normalizeEmail(formData.get("email"));
  if (!email.includes("@")) {
    return { error: "Informe um e-mail válido." };
  }
  if (!mailConfigured()) {
    return { error: "Envio de e-mail ainda não está configurado." };
  }

  const code = generateLoginCode();
  try {
    await saveLoginOtp(email, code);
  } catch (error) {
    console.error("Falha ao salvar codigo OTP", error);
    return { error: "Não foi possível gerar o código. Tente de novo." };
  }

  const sent = await sendLoginCodeEmail(email, code);
  if (sent.error) return { error: sent.error };

  return { sent: true, email };
}

export async function verifyLoginCode(
  _prev: LoginCodeFormState,
  formData: FormData,
): Promise<LoginCodeFormState> {
  const email = normalizeEmail(formData.get("email"));
  const code = String(formData.get("code") ?? "");
  const returnTo = safeReturnPath(formData.get("next"));

  if (!email.includes("@")) {
    return { error: "E-mail inválido.", email };
  }
  if (!code.trim()) {
    return { error: "Informe o código de 6 dígitos.", sent: true, email };
  }

  const valid = await verifyLoginOtp(email, code);
  if (!valid) {
    return {
      error: "Código inválido ou expirado.",
      sent: true,
      email,
    };
  }

  await ensureAdminFromEnv();
  let account = await findAccountByEmail(email);
  if (!account) {
    const created = await createClient({ name: email, email });
    account = "error" in created ? await findAccountByEmail(email) : created.account;
  }
  if (!account) {
    return {
      error: "Este e-mail não tem mais acesso.",
      sent: true,
      email,
    };
  }

  const token = await signSession({
    userId: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
  });

  let destination = returnTo;
  if (account.role === "admin") {
    destination = returnTo.startsWith("/admin") ? returnTo : "/admin";
  } else {
    const proposal = await getLatestProposalForUser(account.id);
    if (proposal?.status === "sent" || proposal?.status === "accepted") {
      destination = "/propostas";
    }
  }

  const jar = await cookies();
  jar.set(sessionCookie, token, sessionCookieOptions(await requestOrigin()));
  redirect(destination);
}

export async function logout() {
  const jar = await cookies();
  jar.delete(sessionCookie);
  redirect("/");
}
