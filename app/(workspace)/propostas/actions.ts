"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  acceptProposal,
  createProposalRequest,
  sendProposalToClient,
} from "@/lib/proposals-store";

export async function submitProposalRequest(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return { error: "Faça login para solicitar uma proposta." };
  }

  const companyName = String(formData.get("companyName") ?? "");
  const segment = String(formData.get("segment") ?? "");
  const goals = String(formData.get("goals") ?? "");
  const contactPhone = String(formData.get("contactPhone") ?? "");
  const budgetRaw = String(formData.get("monthlyMediaBudget") ?? "").trim();
  const monthlyMediaBudget = budgetRaw ? Number.parseInt(budgetRaw, 10) : null;

  if (!companyName.trim()) {
    return { error: "Informe o nome da empresa." };
  }

  const result = await createProposalRequest({
    userId: session.userId,
    companyName,
    segment,
    goals,
    contactPhone,
    monthlyMediaBudget: Number.isFinite(monthlyMediaBudget) ? monthlyMediaBudget : null,
  });

  if ("error" in result) return result;
  revalidatePath("/propostas");
  return { ok: true as const };
}

export async function acceptProposalAction(proposalId: string) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return { error: "Faça login para aceitar a proposta." };
  }

  const result = await acceptProposal(proposalId, session.userId);
  if ("error" in result) return result;
  revalidatePath("/propostas");
  return { ok: true as const, planActive: result.planActive };
}

export async function adminSendProposal(proposalId: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Sem permissão." };
  }

  const result = await sendProposalToClient(proposalId);
  if ("error" in result) return result;
  revalidatePath("/propostas");
  return { ok: true as const };
}
