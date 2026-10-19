"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { ProposalCommercialPayload } from "@/lib/proposal-types";
import { confirmBillingPayment } from "@/lib/billing-store";
import {
  adminCreateAndSendProposal,
  adminDeleteProposal,
  adminPublishProposal,
  adminSaveProposalDraft,
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

export async function adminSaveProposalWizardAction(input: {
  proposalId?: string;
  userId: string;
  clientEmail?: string;
  clientName?: string;
  companyName: string;
  segment?: string;
  goals?: string;
  contactPhone?: string;
  monthlyMediaBudget?: number | null;
  commercial: ProposalCommercialPayload;
}) {
  await requireAdmin();

  const result = await adminSaveProposalDraft({
    proposalId: input.proposalId,
    userId: input.userId,
    clientEmail: input.clientEmail,
    clientName: input.clientName,
    companyName: input.companyName,
    segment: input.segment,
    goals: input.goals,
    contactPhone: input.contactPhone,
    monthlyMediaBudget: input.monthlyMediaBudget,
    commercial: input.commercial,
  });

  if ("error" in result) return result;
  revalidatePath("/admin");
  revalidatePath(`/admin/propostas/${result.proposal.id}/preview`);
  return result;
}

export async function adminPublishProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await adminPublishProposal(proposalId);
  if ("error" in result) return result;
  revalidatePath("/admin");
  revalidatePath("/propostas");
  revalidatePath(`/admin/propostas/${proposalId}/preview`);
  return result;
}

export async function adminSendProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await sendProposalToClient(proposalId);
  if ("error" in result) return result;
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function adminDeleteProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await adminDeleteProposal(proposalId);
  if ("error" in result) return result;
  revalidatePath("/admin");
  revalidatePath("/propostas");
  return { ok: true as const };
}

export async function adminConfirmBillingPaymentAction(billingItemId: string) {
  await requireAdmin();
  const result = await confirmBillingPayment(billingItemId);
  if ("error" in result) return result;
  revalidatePath("/admin");
  revalidatePath("/servicos");
  return { ok: true as const };
}
