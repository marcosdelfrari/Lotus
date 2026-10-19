import Link from "next/link";
import { redirect } from "next/navigation";
import { ProposalClientFlow } from "@/app/components/proposal-client-flow";
import { getSession } from "@/lib/auth";
import { hasActivePlan } from "@/lib/plan";
import { getLatestProposalForUser } from "@/lib/proposals-store";

export const instant = false;

export default async function ServicosContratoPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "admin") {
    redirect("/admin");
  }

  if (!hasActivePlan(session)) {
    redirect("/propostas");
  }

  const proposal = await getLatestProposalForUser(session.userId, session.email);

  if (!proposal || proposal.status !== "accepted") {
    redirect("/propostas");
  }

  return (
    <div className="space-y-4">
      <Link
        href="/servicos"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Voltar aos serviços contratados
      </Link>
      <ProposalClientFlow proposal={proposal} contractReviewOnly planAlreadyActive />
    </div>
  );
}
