"use client";

import { adminSaveMarketingPlanAction } from "@/app/(workspace)/admin/actions";
import { MarketingPlanPanel } from "@/app/components/marketing-plan-panel";
import type { ClientCompanyOption } from "@/lib/client-companies-store";
import type { MarketingPlanView } from "@/lib/marketing-plans-store";
import type { OrgAccessRole } from "@/lib/org-roles";

export function AdminPostHiringCampaignPanel({
  trafficProposalId,
  proposalCompanyName,
  companies,
  initialPlan,
}: {
  trafficProposalId: string;
  proposalCompanyName: string;
  companies: ClientCompanyOption[];
  initialPlan: MarketingPlanView | null;
}) {
  return (
    <MarketingPlanPanel
      role={"admin" satisfies OrgAccessRole}
      proposalId={trafficProposalId}
      proposalCompanyName={proposalCompanyName}
      companies={companies}
      initialPlan={initialPlan}
      onSave={adminSaveMarketingPlanAction}
    />
  );
}
