import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/page-header";
import { ProposalAcceptPanel } from "@/app/components/proposal-accept-panel";
import { ProposalRequestForm } from "@/app/components/proposal-request-form";
import { WhatsappNextStep } from "@/app/components/whatsapp-next-step";
import { getSession } from "@/lib/auth";
import { getInterestForUser } from "@/lib/interests-store";
import { hasActivePlan } from "@/lib/plan";
import { getLatestProposalForUser } from "@/lib/proposals-store";

export const instant = false;

export default async function PropostasPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "admin") {
    redirect("/admin");
  }

  const [interest, proposal] = await Promise.all([
    getInterestForUser(session.userId),
    getLatestProposalForUser(session.userId),
  ]);

  if (proposal && (proposal.status === "sent" || proposal.status === "accepted")) {
    return (
      <>
        <PageHeader
          title="Sua proposta"
          description="Revise escopo, valores e condições. Ao aceitar, ativamos o plano no painel vinculado ao seu e-mail."
        />
        <ProposalAcceptPanel
          proposal={proposal}
          planAlreadyActive={hasActivePlan(session)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Um último detalhe."
        description="Precisamos do seu WhatsApp para enviar o diagnóstico da sua operação e alinhar os próximos passos."
      />
      {interest ? <WhatsappNextStep /> : <ProposalRequestForm />}
    </>
  );
}
