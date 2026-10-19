import { ProposalStep6Review } from "@/app/components/proposal-flow-sections";
import type { TrafficProposalView } from "@/lib/proposal-types";

/** Resumo completo (compatível com telas que ainda usam o componente legado). */
export function ProposalSummary({ proposal }: { proposal: TrafficProposalView }) {
  return <ProposalStep6Review proposal={proposal} />;
}
