"use server";

import { revalidatePath } from "next/cache";
import type { AcceptanceDevice } from "@/lib/acceptance";
import { getSession } from "@/lib/auth";
import { createInterest } from "@/lib/interests-store";
import {
  acceptProposal,
  createProposalRequest,
  sendProposalToClient,
} from "@/lib/proposals-store";

export async function submitInterest(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return { error: "Entre com o Google para continuar." };
  }

  const result = await createInterest({
    userId: session.userId,
    name: session.name,
    email: session.email,
    whatsapp: String(formData.get("whatsapp") ?? ""),
  });

  if ("error" in result) return result;
  revalidatePath("/propostas");
  return { ok: true as const };
}

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
    clientEmail: session.email,
    clientName: session.name,
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

export async function acceptProposalAction(proposalId: string, device: AcceptanceDevice) {
  const session = await getSession();
  if (!session || session.role !== "client") {
    return { error: "Faça login para aceitar a proposta." };
  }
  if (!device?.hash || !device.userAgent) {
    return { error: "Não foi possível identificar o navegador deste aceite." };
  }

  const result = await acceptProposal(
    proposalId,
    session.userId,
    { name: session.name, email: session.email },
    device,
  );
  if ("error" in result) return result;
  revalidatePath("/propostas");
  return {
    ok: true as const,
    planActive: result.planActive,
    emailSent: result.emailSent,
    emailError: result.emailError,
  };
}

export async function adminSendProposal(proposalId: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "Sem permissão." };
  }

  const result = await sendProposalToClient(proposalId);
  if ("error" in result) return result;
  revalidatePath("/propostas");
  revalidatePath("/admin");
  return { ok: true as const };
}
