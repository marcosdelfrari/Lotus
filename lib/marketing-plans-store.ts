import {
  labelForOperationProposal,
  labelsForAdFormats,
  labelsForFunnelTouchpoints,
  labelsForMediaChannels,
  type MarketingPlanFields,
  proposalToPlanFields,
} from "@/lib/campaign-marketing-options";
import { MarketingPlanStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type MarketingPlanView = MarketingPlanFields & {
  id: string;
  proposalId: string;
  analyticsCompanyId: string;
  operationProposalLabel: string;
  funnelTouchpointLabels: string[];
  mediaChannelLabels: string[];
  adFormatLabels: string[];
  status: MarketingPlanStatus;
  updatedAt: string;
};

function toView(row: {
  id: string;
  proposalId: string;
  analyticsCompanyId: string;
  operationProposal: string;
  funnelTouchpoints: string[];
  mediaChannels: string[];
  adFormats: string[];
  notes: string;
  customAssets: string;
  status: MarketingPlanStatus;
  updatedAt: Date;
}): MarketingPlanView {
  const fields = proposalToPlanFields({
    operationProposal: row.operationProposal,
    funnelTouchpoints: row.funnelTouchpoints,
    mediaChannels: row.mediaChannels,
    adFormats: row.adFormats,
    campaignPurpose: row.operationProposal,
    acquisitionFlow: "",
    campaignTypes: row.adFormats,
    notes: row.notes,
    customAssets: row.customAssets,
  });

  return {
    ...fields,
    id: row.id,
    proposalId: row.proposalId,
    analyticsCompanyId: row.analyticsCompanyId,
    operationProposalLabel: labelForOperationProposal(fields.operationProposal),
    funnelTouchpointLabels: labelsForFunnelTouchpoints(fields.funnelTouchpoints),
    mediaChannelLabels: labelsForMediaChannels(fields.mediaChannels),
    adFormatLabels: labelsForAdFormats(fields.adFormats),
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getMarketingPlanForProposal(
  proposalId: string,
  analyticsCompanyId?: string,
) {
  const row = await prisma.marketingPlan.findFirst({
    where: {
      proposalId,
      ...(analyticsCompanyId ? { analyticsCompanyId } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });
  return row ? toView(row) : null;
}

export async function listMarketingPlansForProposal(proposalId: string) {
  const rows = await prisma.marketingPlan.findMany({
    where: { proposalId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(toView);
}

export async function saveMarketingPlan(input: {
  proposalId: string;
  analyticsCompanyId: string;
  plan: MarketingPlanFields;
}) {
  const proposal = await prisma.trafficProposal.findUnique({
    where: { id: input.proposalId },
  });
  if (!proposal) {
    return { error: "Proposta não encontrada." } as const;
  }
  if (proposal.status !== "accepted") {
    return { error: "Plano de marketing só após aceite da proposta." } as const;
  }

  const { plan } = input;
  if (!plan.operationProposal) {
    return { error: "Selecione a proposta da operação." } as const;
  }
  if (plan.funnelTouchpoints.length === 0) {
    return { error: "Marque ao menos uma etapa do funil (landing, presell, etc.)." } as const;
  }
  if (plan.mediaChannels.length === 0) {
    return {
      error:
        "Marque ao menos uma plataforma: Google Ads, YouTube, Instagram ou Facebook.",
    } as const;
  }
  if (plan.adFormats.length === 0) {
    return { error: "Marque ao menos um tipo de anúncio." } as const;
  }

  const data = {
    operationProposal: plan.operationProposal,
    funnelTouchpoints: plan.funnelTouchpoints,
    mediaChannels: plan.mediaChannels,
    adFormats: plan.adFormats,
    notes: plan.notes.trim(),
    customAssets: "",
    status: MarketingPlanStatus.saved,
  };

  const row = await prisma.marketingPlan.upsert({
    where: {
      proposalId_analyticsCompanyId: {
        proposalId: input.proposalId,
        analyticsCompanyId: input.analyticsCompanyId,
      },
    },
    create: {
      proposalId: input.proposalId,
      analyticsCompanyId: input.analyticsCompanyId,
      ...data,
    },
    update: data,
  });

  return { plan: toView(row) } as const;
}
