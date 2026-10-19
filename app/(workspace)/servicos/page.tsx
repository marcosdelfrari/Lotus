import { redirect } from "next/navigation";
import { ContractedServicesScreen } from "@/app/components/contracted-services-screen";
import {
  ensureInitialBillingForProposal,
  listBillingForProposal,
} from "@/lib/billing-store";
import { getSession } from "@/lib/auth";
import { hasActivePlan } from "@/lib/plan";
import {
  ensureProPlanForAcceptedProposal,
  getLatestProposalForUser,
} from "@/lib/proposals-store";

export const instant = false;

export default async function ServicosContratadosPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "admin") {
    redirect("/admin");
  }

  let planActive = hasActivePlan(session);
  const proposal = await getLatestProposalForUser(session.userId, session.email);

  if (!proposal || proposal.status !== "accepted") {
    redirect("/propostas");
  }

  if (!planActive) {
    await ensureProPlanForAcceptedProposal({
      proposal,
      sessionUserId: session.userId,
      sessionEmail: session.email,
      planAlreadyActive: planActive,
    });
    const refreshed = await getSession();
    planActive = refreshed ? hasActivePlan(refreshed) : false;
  }

  if (!planActive) {
    redirect("/propostas");
  }

  await ensureInitialBillingForProposal(proposal.id);
  const billingItems = await listBillingForProposal(proposal.id);

  return (
    <ContractedServicesScreen proposal={proposal} billingItems={billingItems} />
  );
}
