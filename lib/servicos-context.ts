import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasActivePlan } from "@/lib/plan";
import {
  ensureProPlanForAcceptedProposal,
  getLatestProposalForUser,
} from "@/lib/proposals-store";

export async function requireAcceptedClientContext() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/servicos");
  }
  if (session.role === "admin") {
    redirect("/admin/prospeccao");
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

  return { session, proposal };
}
