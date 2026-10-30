"use server";

import { redirect } from "next/navigation";
import { completeClaimAttempt } from "@/lib/agent-auth";
import { getSession } from "@/lib/auth";

export type ClaimFormState = { error?: string; ok?: boolean } | null;

export async function completeClaimAction(
  _prev: ClaimFormState,
  formData: FormData,
): Promise<ClaimFormState> {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/claim");
  }

  const claimAttemptToken = String(formData.get("claim_attempt_token") || "");
  const userCode = String(formData.get("user_code") || "");
  if (!claimAttemptToken || !userCode) {
    return { error: "Informe o código de 6 dígitos." };
  }

  const result = completeClaimAttempt({
    claimAttemptToken,
    userCode,
    user: {
      sub: session.userId,
      email: session.email,
      name: session.name,
    },
  });

  if ("error" in result) {
    if (result.error === "expired") return { error: "Código expirado. Peça um novo ao agente." };
    if (result.error === "invalid_code") return { error: "Código inválido." };
    if (result.error === "email_mismatch") {
      return { error: "Faça login com o e-mail indicado pelo agente." };
    }
    return { error: "Não foi possível confirmar." };
  }

  return { ok: true };
}
