"use client";

import { ProposalClientFlow } from "@/app/components/proposal-client-flow";
import type { TrafficProposalView } from "@/lib/proposal-types";

export function ProposalAcceptPanel({
  proposal,
  planAlreadyActive,
}: {
  proposal: TrafficProposalView;
  planAlreadyActive: boolean;
}) {
  if (proposal.status === "requested") {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <p className="text-sm font-medium">Solicitação recebida</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Estamos montando sua proposta personalizada. Você será avisado quando estiver
          disponível aqui para aceite.
        </p>
        <p className="mt-4 text-[12px] text-muted">
          {proposal.companyName} · enviada em{" "}
          {new Date(proposal.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>
    );
  }

  return (
    <ProposalClientFlow proposal={proposal} planAlreadyActive={planAlreadyActive} />
  );
}
