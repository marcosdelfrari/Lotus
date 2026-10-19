import { prisma } from "@/lib/prisma";
import { toProposalView, type TrafficProposalView } from "@/lib/proposal-types";
import { setClientPlanActive } from "@/lib/users-store";

const defaultCommercial = {
  title: "Gestão de tráfego pago (Google Ads + Meta Ads)",
  scope: [
    "Estruturação e gestão contínua de campanhas",
    "Landing page de captação alinhada às campanhas",
    "Relatórios quinzenais de investimento x resultados",
    "Integração com painel Lótus Analytics (Plano Pro)",
  ],
  services: [
    {
      name: "Gestão de mídia paga",
      description: "Setup, otimização e acompanhamento Google + Meta",
      value: 3200,
    },
    {
      name: "Landing de conversão",
      description: "Página responsiva e formulário integrado",
      value: 1800,
    },
    {
      name: "Tracking e analytics",
      description: "Eventos, UTMs e painel Pro liberado após aceite",
      value: 900,
    },
  ],
  adBudgetSuggestion: 4500,
  deadlineDays: 90,
  conditions: [
    "Fee mensal de gestão conforme serviços acima",
    "Investimento em mídia pago diretamente às plataformas",
    "Materiais criativos enviados pelo cliente em até 5 dias úteis",
    "Alterações de escopo mediante aditivo",
  ],
};

export async function getLatestProposalForUser(userId: string) {
  const row = await prisma.trafficProposal.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return row ? toProposalView(row) : null;
}

export async function listRequestedProposals() {
  const rows = await prisma.trafficProposal.findMany({
    where: { status: "requested" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });
  return rows.map((row) => ({
    ...toProposalView(row),
    userName: row.user.name,
    userEmail: row.user.email,
  }));
}

export async function createProposalRequest(input: {
  userId: string;
  companyName: string;
  segment: string;
  monthlyMediaBudget: number | null;
  goals: string;
  contactPhone: string;
}) {
  const open = await prisma.trafficProposal.findFirst({
    where: {
      userId: input.userId,
      status: { in: ["requested", "sent"] },
    },
  });
  if (open) {
    return { error: "Você já tem uma solicitação ou proposta em andamento." } as const;
  }

  const row = await prisma.trafficProposal.create({
    data: {
      userId: input.userId,
      companyName: input.companyName.trim(),
      segment: input.segment.trim(),
      monthlyMediaBudget: input.monthlyMediaBudget,
      goals: input.goals.trim(),
      contactPhone: input.contactPhone.trim(),
      status: "requested",
    },
  });
  return { proposal: toProposalView(row) } as const;
}

export async function sendProposalToClient(proposalId: string) {
  const row = await prisma.trafficProposal.findUnique({ where: { id: proposalId } });
  if (!row || row.status !== "requested") {
    return { error: "Solicitação não encontrada ou já enviada." } as const;
  }

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const updated = await prisma.trafficProposal.update({
    where: { id: proposalId },
    data: {
      status: "sent",
      title: defaultCommercial.title,
      scope: defaultCommercial.scope,
      services: defaultCommercial.services,
      adBudgetSuggestion: defaultCommercial.adBudgetSuggestion,
      deadlineDays: defaultCommercial.deadlineDays,
      conditions: defaultCommercial.conditions,
      validUntil,
    },
  });
  return { proposal: toProposalView(updated) } as const;
}

export async function acceptProposal(proposalId: string, userId: string) {
  const row = await prisma.trafficProposal.findUnique({ where: { id: proposalId } });
  if (!row || row.userId !== userId) {
    return { error: "Proposta não encontrada." } as const;
  }
  if (row.status !== "sent") {
    return { error: "Esta proposta não está disponível para aceite." } as const;
  }

  const updated = await prisma.trafficProposal.update({
    where: { id: proposalId },
    data: {
      status: "accepted",
      acceptedAt: new Date(),
    },
  });

  const plan = await setClientPlanActive(userId, true);
  if ("error" in plan) {
    return { error: plan.error } as const;
  }

  return { proposal: toProposalView(updated), planActive: true } as const;
}

export function canAccept(proposal: TrafficProposalView) {
  return proposal.status === "sent";
}
