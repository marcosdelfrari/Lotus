import type { ProposalStatus } from "@/lib/generated/prisma/client";

export type ProposalServiceLine = {
  name: string;
  description: string;
  value: number;
};

export type ImplementationPlanStep = {
  title: string;
  description: string;
};

export type ProposalCommercialPayload = {
  title: string;
  intro: string;
  scope: string[];
  services: ProposalServiceLine[];
  setupFee: number | null;
  adBudgetSuggestion: number | null;
  deadlineDays: number | null;
  implementationPlan: ImplementationPlanStep[];
  conditions: string[];
  terms: string[];
};

export type TrafficProposalView = {
  id: string;
  userId: string;
  companyName: string;
  segment: string;
  monthlyMediaBudget: number | null;
  goals: string;
  contactPhone: string;
  intro: string;
  title: string | null;
  scope: string[];
  services: ProposalServiceLine[];
  setupFee: number | null;
  adBudgetSuggestion: number | null;
  deadlineDays: number | null;
  implementationPlan: ImplementationPlanStep[];
  conditions: string[];
  terms: string[];
  validUntil: string | null;
  status: ProposalStatus;
  acceptedAt: string | null;
  createdAt: string;
};

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseServices(value: unknown): ProposalServiceLine[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.name !== "string") return null;
      return {
        name: row.name,
        description: typeof row.description === "string" ? row.description : "",
        value: typeof row.value === "number" ? row.value : 0,
      };
    })
    .filter((item): item is ProposalServiceLine => item !== null);
}

function parseImplementationPlan(value: unknown): ImplementationPlanStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.title !== "string") return null;
      return {
        title: row.title,
        description: typeof row.description === "string" ? row.description : "",
      };
    })
    .filter((item): item is ImplementationPlanStep => item !== null);
}

export function toProposalView(row: {
  id: string;
  userId: string;
  companyName: string;
  segment: string;
  monthlyMediaBudget: number | null;
  goals: string;
  contactPhone: string;
  intro: string;
  title: string | null;
  scope: unknown;
  services: unknown;
  setupFee: number | null;
  adBudgetSuggestion: number | null;
  deadlineDays: number | null;
  implementationPlan: unknown;
  conditions: unknown;
  terms: unknown;
  validUntil: Date | null;
  status: ProposalStatus;
  acceptedAt: Date | null;
  createdAt: Date;
}): TrafficProposalView {
  return {
    id: row.id,
    userId: row.userId,
    companyName: row.companyName,
    segment: row.segment,
    monthlyMediaBudget: row.monthlyMediaBudget,
    goals: row.goals,
    contactPhone: row.contactPhone,
    intro: row.intro,
    title: row.title,
    scope: parseStringArray(row.scope),
    services: parseServices(row.services),
    setupFee: row.setupFee,
    adBudgetSuggestion: row.adBudgetSuggestion,
    deadlineDays: row.deadlineDays,
    implementationPlan: parseImplementationPlan(row.implementationPlan),
    conditions: parseStringArray(row.conditions),
    terms: parseStringArray(row.terms),
    validUntil: row.validUntil ? row.validUntil.toISOString().slice(0, 10) : null,
    status: row.status,
    acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function proposalTotalServices(proposal: TrafficProposalView) {
  return proposal.services.reduce((sum, line) => sum + line.value, 0);
}

export function proposalHasCommercialContent(proposal: TrafficProposalView) {
  return Boolean(proposal.title && proposal.scope.length > 0);
}
