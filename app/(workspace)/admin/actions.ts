"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  adminCreateAndSendProposal,
  sendProposalToClient,
} from "@/lib/proposals-store";

export type AdminFormState = { error?: string; ok?: boolean } | null;

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin");
  }
  return session;
}

export async function adminCreateProposalAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const companyName = String(formData.get("companyName") ?? "").trim();
  const segment = String(formData.get("segment") ?? "");
  const goals = String(formData.get("goals") ?? "");
  const contactPhone = String(formData.get("contactPhone") ?? "");
  const budgetRaw = String(formData.get("monthlyMediaBudget") ?? "").trim();
  const monthlyMediaBudget = budgetRaw ? Number.parseInt(budgetRaw, 10) : null;

  if (!userId) return { error: "Cliente não selecionado." };
  if (!companyName) return { error: "Informe o nome da empresa." };

  const result = await adminCreateAndSendProposal({
    userId,
    companyName,
    segment,
    goals,
    contactPhone,
    monthlyMediaBudget: Number.isFinite(monthlyMediaBudget) ? monthlyMediaBudget : null,
  });

  if ("error" in result) return { error: result.error };
  revalidatePath("/admin");
  revalidatePath("/propostas");
  return { ok: true };
}

export async function adminSendProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await sendProposalToClient(proposalId);
  if ("error" in result) return result;
  revalidatePath("/admin");
  return { ok: true as const };
}
