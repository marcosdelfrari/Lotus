import { analyticsPrisma } from "@/lib/analytics-db";
import { defaultCommercialPayload } from "@/lib/commercial-defaults";
import type { AcceptanceDevice } from "@/lib/acceptance";
import { sendAcceptedProposalEmail, sendProposalEmail } from "@/lib/mail";
import { ProposalStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  proposalHasCommercialContent,
  toProposalView,
  type ProposalCommercialPayload,
  type TrafficProposalView,
} from "@/lib/proposal-types";
import { setClientPlanActive } from "@/lib/users-store";

const OPEN_PROPOSAL_STATUSES = [
  ProposalStatus.draft,
  ProposalStatus.requested,
  ProposalStatus.sent,
] as const;

function normalizeClientEmail(email: string) {
  return email.trim().toLowerCase();
}

async function clientContactForUser(userId: string) {
  const user = await analyticsPrisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return null;
  return {
    clientEmail: normalizeClientEmail(user.email),
    clientName: user.name.trim(),
  };
}

async function resolveClientFields(userId: string, override?: { email?: string; name?: string }) {
  if (override?.email?.trim()) {
    return {
      clientEmail: normalizeClientEmail(override.email),
      clientName: (override.name ?? "").trim(),
    };
  }
  const fromAnalytics = await clientContactForUser(userId);
  return fromAnalytics ?? { clientEmail: "", clientName: "" };
}

function addValidUntilDays(days: number) {
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + days);
  return validUntil;
}

function commercialData(payload: ProposalCommercialPayload) {
  return {
    title: payload.title.trim(),
    intro: payload.intro.trim(),
    scope: payload.scope,
    services: payload.services,
    setupFee: payload.setupFee,
    adBudgetSuggestion: payload.adBudgetSuggestion,
    deadlineDays: payload.deadlineDays,
    implementationPlan: payload.implementationPlan,
    conditions: payload.conditions,
    terms: payload.terms,
  };
}

export async function getProposalById(proposalId: string) {
  const row = await prisma.trafficProposal.findUnique({
    where: { id: proposalId },
  });
  return row ? toProposalView(row) : null;
}

export async function getLatestProposalForUser(userId: string, clientEmail?: string) {
  const email = clientEmail ? normalizeClientEmail(clientEmail) : "";
  const row = await prisma.trafficProposal.findFirst({
    where: email
      ? { OR: [{ userId }, { clientEmail: email }] }
      : { userId },
    orderBy: { createdAt: "desc" },
  });
  return row ? toProposalView(row) : null;
}

export async function getOpenProposalForUser(userId: string, clientEmail?: string) {
  const email = clientEmail ? normalizeClientEmail(clientEmail) : "";
  const row = await prisma.trafficProposal.findFirst({
    where: {
      ...(email ? { OR: [{ userId }, { clientEmail: email }] } : { userId }),
      status: { in: [...OPEN_PROPOSAL_STATUSES] },
    },
    orderBy: { createdAt: "desc" },
  });
  return row ? toProposalView(row) : null;
}

export async function adminSaveProposalDraft(input: {
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
  validForDays?: number;
}) {
  const companyName = input.companyName.trim();
  if (!companyName) {
    return { error: "Informe o nome da empresa." } as const;
  }

  const contact = await resolveClientFields(input.userId, {
    email: input.clientEmail,
    name: input.clientName,
  });

  const clientFields = {
    companyName,
    segment: (input.segment ?? "").trim(),
    goals: (input.goals ?? "").trim(),
    contactPhone: (input.contactPhone ?? "").trim(),
    monthlyMediaBudget: input.monthlyMediaBudget ?? null,
    ...commercialData(input.commercial),
    ...(contact.clientEmail ? contact : {}),
  };

  if (input.proposalId) {
    const existing = await prisma.trafficProposal.findUnique({
      where: { id: input.proposalId },
    });
    if (!existing) return { error: "Proposta não encontrada." } as const;
    if (existing.status === ProposalStatus.cancelled) {
      return { error: "Esta proposta não pode mais ser editada." } as const;
    }

    const updated = await prisma.trafficProposal.update({
      where: { id: input.proposalId },
      data: {
        ...clientFields,
        status: existing.status,
      },
    });
    return { proposal: toProposalView(updated) } as const;
  }

  const open = await prisma.trafficProposal.findFirst({
    where: {
      userId: input.userId,
      status: { in: [...OPEN_PROPOSAL_STATUSES] },
    },
  });
  if (open) {
    const updated = await prisma.trafficProposal.update({
      where: { id: open.id },
      data: {
        ...clientFields,
        status: open.status,
      },
    });
    return { proposal: toProposalView(updated) } as const;
  }

  const row = await prisma.trafficProposal.create({
    data: {
      userId: input.userId,
      status: ProposalStatus.draft,
      ...clientFields,
    },
  });
  return { proposal: toProposalView(row) } as const;
}

export async function adminPublishProposal(proposalId: string) {
  const row = await prisma.trafficProposal.findUnique({
    where: { id: proposalId },
  });
  if (!row) return { error: "Proposta não encontrada." } as const;
  if (row.status !== ProposalStatus.draft && row.status !== ProposalStatus.requested) {
    return { error: "Somente rascunhos ou solicitações podem ser enviadas." } as const;
  }

  const view = toProposalView(row);
  if (!proposalHasCommercialContent(view)) {
    return { error: "Complete título e escopo antes de enviar." } as const;
  }

  const contact = await resolveClientFields(row.userId, {
    email: row.clientEmail || undefined,
    name: row.clientName || undefined,
  });

  const updated = await prisma.trafficProposal.update({
    where: { id: proposalId },
    data: {
      status: ProposalStatus.sent,
      validUntil: addValidUntilDays(30),
      ...(contact.clientEmail ? contact : {}),
    },
  });
  const proposal = toProposalView(updated);

  const toEmail = contact.clientEmail || null;
  const toName = contact.clientName || proposal.companyName;
  if (!toEmail) {
    return {
      proposal,
      emailSent: false,
      emailError: "Cliente sem e-mail (salve com conta do Analytics selecionada).",
    } as const;
  }

  const email = await sendProposalEmail({
    to: toEmail,
    name: toName,
    proposal,
  });
  if ("error" in email) {
    return { proposal, emailSent: false, emailError: email.error } as const;
  }

  return { proposal, emailSent: true } as const;
}

/** @deprecated Use admin wizard + publish */
export async function adminCreateAndSendProposal(input: {
  userId: string;
  companyName: string;
  segment?: string;
  goals?: string;
  contactPhone?: string;
  monthlyMediaBudget?: number | null;
}) {
  const commercial = defaultCommercialPayload();
  const draft = await adminSaveProposalDraft({
    userId: input.userId,
    companyName: input.companyName,
    segment: input.segment,
    goals: input.goals,
    contactPhone: input.contactPhone,
    monthlyMediaBudget: input.monthlyMediaBudget,
    commercial,
  });
  if ("error" in draft) return draft;
  return adminPublishProposal(draft.proposal.id);
}

async function displayNamesForProposals(
  rows: { userId: string; clientEmail: string; clientName: string }[],
) {
  const missingIds = [
    ...new Set(
      rows.filter((row) => !row.clientEmail).map((row) => row.userId),
    ),
  ];
  const users =
    missingIds.length > 0
      ? await analyticsPrisma.user.findMany({
          where: { id: { in: missingIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const byId = new Map(users.map((user) => [user.id, user]));

  return rows.map((row) => {
    const user = byId.get(row.userId);
    return {
      userName: row.clientName || user?.name || "Cliente",
      userEmail: row.clientEmail || user?.email || "",
    };
  });
}

export async function listSentAndAcceptedProposals() {
  const rows = await prisma.trafficProposal.findMany({
    where: { status: { in: [ProposalStatus.sent, ProposalStatus.accepted] } },
    orderBy: { updatedAt: "desc" },
  });
  const names = await displayNamesForProposals(rows);

  return rows.map((row, index) => ({
    ...toProposalView(row),
    ...names[index],
  }));
}

export async function listRequestedProposals() {
  const rows = await prisma.trafficProposal.findMany({
    where: { status: ProposalStatus.requested },
    orderBy: { createdAt: "asc" },
  });
  const names = await displayNamesForProposals(rows);

  return rows.map((row, index) => ({
    ...toProposalView(row),
    ...names[index],
  }));
}

export async function createProposalRequest(input: {
  userId: string;
  clientEmail: string;
  clientName: string;
  companyName: string;
  segment: string;
  monthlyMediaBudget: number | null;
  goals: string;
  contactPhone: string;
}) {
  const clientEmail = normalizeClientEmail(input.clientEmail);
  const open = await prisma.trafficProposal.findFirst({
    where: {
      OR: [{ userId: input.userId }, ...(clientEmail ? [{ clientEmail }] : [])],
      status: { in: [...OPEN_PROPOSAL_STATUSES] },
    },
  });
  if (open) {
    return {
      error: "Você já tem uma solicitação ou proposta em andamento.",
    } as const;
  }

  const row = await prisma.trafficProposal.create({
    data: {
      userId: input.userId,
      clientEmail,
      clientName: input.clientName.trim(),
      companyName: input.companyName.trim(),
      segment: input.segment.trim(),
      monthlyMediaBudget: input.monthlyMediaBudget,
      goals: input.goals.trim(),
      contactPhone: input.contactPhone.trim(),
      status: ProposalStatus.requested,
    },
  });
  return { proposal: toProposalView(row) } as const;
}

export async function sendProposalToClient(proposalId: string) {
  const row = await prisma.trafficProposal.findUnique({
    where: { id: proposalId },
  });
  if (!row || row.status !== ProposalStatus.requested) {
    return { error: "Solicitação não encontrada ou já enviada." } as const;
  }

  const view = toProposalView(row);
  if (proposalHasCommercialContent(view)) {
    return adminPublishProposal(proposalId);
  }

  const commercial = defaultCommercialPayload();
  await prisma.trafficProposal.update({
    where: { id: proposalId },
    data: commercialData(commercial),
  });
  return adminPublishProposal(proposalId);
}

export async function acceptProposal(
  proposalId: string,
  userId: string,
  client: { name: string; email: string },
  device: AcceptanceDevice,
) {
  const row = await prisma.trafficProposal.findUnique({
    where: { id: proposalId },
  });
  const clientEmailNorm = normalizeClientEmail(client.email);
  const ownsProposal =
    row &&
    (row.userId === userId ||
      (clientEmailNorm &&
        row.clientEmail &&
        row.clientEmail === clientEmailNorm));
  if (!ownsProposal || !row) {
    return { error: "Proposta não encontrada." } as const;
  }
  if (row.status !== ProposalStatus.sent) {
    return { error: "Esta proposta não está disponível para aceite." } as const;
  }

  const acceptedAt = new Date();
  const acceptance = {
    ...device,
    acceptedAt: acceptedAt.toISOString(),
  };
  const updated = await prisma.trafficProposal.update({
    where: { id: proposalId },
    data: {
      status: ProposalStatus.accepted,
      acceptedAt,
      acceptance,
      clientEmail: clientEmailNorm || row.clientEmail,
      clientName: client.name.trim() || row.clientName,
    },
  });

  const plan = await setClientPlanActive(userId, true);
  if ("error" in plan) {
    return { error: plan.error } as const;
  }

  const proposal = toProposalView(updated);
  const mail = await sendAcceptedProposalEmail({
    to: client.email,
    name: client.name,
    proposal,
    device,
    acceptedAt,
  });

  return {
    proposal,
    planActive: true,
    emailSent: !("error" in mail),
    emailError: "error" in mail ? mail.error : undefined,
  } as const;
}

export function canAccept(proposal: TrafficProposalView) {
  return proposal.status === ProposalStatus.sent;
}
