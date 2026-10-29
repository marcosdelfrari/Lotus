"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { ProposalCommercialPayload } from "@/lib/proposal-types";
import type { MarketingPlanFields } from "@/lib/campaign-marketing-options";
import { saveMarketingPlan } from "@/lib/marketing-plans-store";
import {
  confirmBillingPayment,
  revertBillingPayment,
} from "@/lib/billing-store";
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

function revalidateAdminRoutes() {
  revalidatePath("/admin");
  revalidatePath("/admin/prospeccao");
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/clientes-ativos");
}

function revalidateServicosRoutes() {
  revalidatePath("/servicos");
  revalidatePath("/servicos/financeiro");
  revalidatePath("/servicos/marketing");
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
  revalidateAdminRoutes();
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
  revalidateAdminRoutes();
  revalidatePath(`/admin/propostas/${result.proposal.id}/preview`);
  return result;
}

export async function adminPublishProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await adminPublishProposal(proposalId);
  if ("error" in result) return result;
  revalidateAdminRoutes();
  revalidatePath("/propostas");
  revalidatePath(`/admin/propostas/${proposalId}/preview`);
  return result;
}

export async function adminSendProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await sendProposalToClient(proposalId);
  if ("error" in result) return result;
  revalidateAdminRoutes();
  return { ok: true as const };
}

export async function adminDeleteProposalAction(proposalId: string) {
  await requireAdmin();
  const result = await adminDeleteProposal(proposalId);
  if ("error" in result) return result;
  revalidateAdminRoutes();
  revalidatePath("/propostas");
  return { ok: true as const };
}

export async function adminConfirmBillingPaymentAction(billingItemId: string) {
  await requireAdmin();
  const result = await confirmBillingPayment(billingItemId);
  if ("error" in result) return result;
  revalidateAdminRoutes();
  revalidateServicosRoutes();
  return { ok: true as const };
}

export async function adminRevertBillingPaymentAction(billingItemId: string) {
  await requireAdmin();
  const result = await revertBillingPayment(billingItemId);
  if ("error" in result) return result;
  revalidateAdminRoutes();
  revalidateServicosRoutes();
  return { ok: true as const };
}

export async function adminSaveMarketingPlanAction(input: {
  proposalId: string;
  analyticsCompanyId: string;
  plan: MarketingPlanFields;
}) {
  await requireAdmin();

  const result = await saveMarketingPlan({
    proposalId: input.proposalId,
    analyticsCompanyId: input.analyticsCompanyId,
    plan: input.plan,
  });

  if ("error" in result) return result;
  revalidateAdminRoutes();
  revalidateServicosRoutes();
  return result;
}
