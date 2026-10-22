"use client";

import { clientSaveMarketingPlanAction } from "@/app/(workspace)/servicos/actions";
import { MarketingPlanPanel } from "@/app/components/marketing-plan-panel";
import type { ClientCompanyOption } from "@/lib/client-companies-store";
import type { MarketingPlanView } from "@/lib/marketing-plans-store";
import type { OrgAccessRole } from "@/lib/org-roles";

export function ClientMarketingPlanSection({
  proposalId,
  proposalCompanyName,
  companies,
  savedPlans,
  role,
}: {
  proposalId: string;
  proposalCompanyName: string;
  companies: ClientCompanyOption[];
  savedPlans: MarketingPlanView[];
  role: OrgAccessRole;
}) {
  return (
    <MarketingPlanPanel
      role={role}
      proposalId={proposalId}
      proposalCompanyName={proposalCompanyName}
      companies={companies}
      savedPlans={savedPlans}
      clientListLayout
      onSave={clientSaveMarketingPlanAction}
    />
  );
}
