"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MarketingPlanFields } from "@/lib/campaign-marketing-options";
import { getSession } from "@/lib/auth";
import { canEditMarketingPlan } from "@/lib/marketing-access";
import { saveMarketingPlan } from "@/lib/marketing-plans-store";
import { getLatestProposalForUser } from "@/lib/proposals-store";

export async function clientSaveMarketingPlanAction(input: {
  proposalId: string;
  analyticsCompanyId: string;
  plan: MarketingPlanFields;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/servicos");
  }

  const proposal = await getLatestProposalForUser(session.userId, session.email);
  if (!proposal || proposal.id !== input.proposalId || proposal.status !== "accepted") {
    return { error: "Proposta não encontrada ou sem aceite." } as const;
  }

  const allowed = await canEditMarketingPlan(session, input.analyticsCompanyId);
  if (!allowed) {
    return {
      error: "Somente o proprietário da organização pode editar o plano de marketing.",
    } as const;
  }

  const result = await saveMarketingPlan({
    proposalId: input.proposalId,
    analyticsCompanyId: input.analyticsCompanyId,
    plan: input.plan,
  });

  if ("error" in result) return result;
  revalidatePath("/servicos");
  revalidatePath("/servicos/marketing");
  revalidatePath("/admin/clientes-ativos");
  return result;
}
