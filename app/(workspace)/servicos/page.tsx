import { ContractedServicesScreen } from "@/app/components/contracted-services-screen";
import {
  ensureInitialBillingForProposal,
  listBillingForProposal,
} from "@/lib/billing-store";
import { getMarketingPlanForProposal } from "@/lib/marketing-plans-store";
import { requireAcceptedClientContext } from "@/lib/servicos-context";

export const instant = false;

export default async function ServicosDashPage() {
  const { proposal } = await requireAcceptedClientContext();

  await ensureInitialBillingForProposal(proposal.id);
  const [billingItems, plan] = await Promise.all([
    listBillingForProposal(proposal.id),
    getMarketingPlanForProposal(proposal.id),
  ]);

  const pendingCount = billingItems.filter((item) => item.status === "pending").length;

  return (
    <ContractedServicesScreen
      proposal={proposal}
      pendingBillingCount={pendingCount}
      hasMarketingPlan={Boolean(plan)}
    />
  );
}
