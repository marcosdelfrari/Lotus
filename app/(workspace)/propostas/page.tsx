import { AdminProposalsPanel } from "@/app/components/admin-proposals-panel";
import { PageHeader } from "@/app/components/page-header";
import { ProposalAcceptPanel } from "@/app/components/proposal-accept-panel";
import { ProposalRequestForm } from "@/app/components/proposal-request-form";
import { getSession } from "@/lib/auth";
import { getLatestProposalForUser, listRequestedProposals } from "@/lib/proposals-store";

export default async function PropostasPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "admin") {
    const rows = await listRequestedProposals();
    return (
      <>
        <PageHeader
          title="Solicitações de tráfego pago"
          description="Envie a proposta comercial para o cliente aceitar online. O aceite ativa plan_active (Plano Pro) no cadastro compartilhado com o Analytics."
        />
        <AdminProposalsPanel rows={rows} />
      </>
    );
  }

  const proposal = await getLatestProposalForUser(session.userId);

  return (
    <>
      <PageHeader
        title="Sua proposta"
        description="Solicite gestão de tráfego pago, acompanhe a proposta personalizada e aceite online para liberar o Plano Pro no Lótus Analytics."
      />

      {!proposal ? <ProposalRequestForm /> : null}

      {proposal ? (
        <ProposalAcceptPanel proposal={proposal} planAlreadyActive={session.planActive} />
      ) : null}
    </>
  );
}
