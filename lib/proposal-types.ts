import type { ProposalStatus } from "@/lib/generated/prisma/client";

export type ProposalServiceLine = {
  name: string;
  description: string;
  value: number;
};

export type TrafficProposalView = {
  id: string;
  userId: string;
  companyName: string;
  segment: string;
  monthlyMediaBudget: number | null;
  goals: string;
  contactPhone: string;
  title: string | null;
  scope: string[];
  services: ProposalServiceLine[];
  adBudgetSuggestion: number | null;
  deadlineDays: number | null;
  conditions: string[];
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

export function toProposalView(row: {
  id: string;
  userId: string;
  companyName: string;
  segment: string;
  monthlyMediaBudget: number | null;
  goals: string;
  contactPhone: string;
  title: string | null;
  scope: unknown;
  services: unknown;
  adBudgetSuggestion: number | null;
  deadlineDays: number | null;
  conditions: unknown;
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
    title: row.title,
    scope: parseStringArray(row.scope),
    services: parseServices(row.services),
    adBudgetSuggestion: row.adBudgetSuggestion,
    deadlineDays: row.deadlineDays,
    conditions: parseStringArray(row.conditions),
    validUntil: row.validUntil ? row.validUntil.toISOString().slice(0, 10) : null,
    status: row.status,
    acceptedAt: row.acceptedAt ? row.acceptedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function proposalTotalServices(proposal: TrafficProposalView) {
  return proposal.services.reduce((sum, line) => sum + line.value, 0);
}
