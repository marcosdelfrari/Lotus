import { formatCurrency, formatDate } from "@/lib/format";
import {
  proposalTotalServices,
  type TrafficProposalView,
} from "@/lib/proposal-types";

export function ProposalSummary({ proposal }: { proposal: TrafficProposalView }) {
  const total = proposalTotalServices(proposal);

  return (
    <div className="space-y-6">
      {proposal.title ? (
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-muted">Proposta</p>
          <h2 className="mt-2 text-lg font-medium">{proposal.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{proposal.companyName}</p>
        </section>
      ) : null}

      {proposal.scope.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-medium">Escopo</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {proposal.scope.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-muted">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {proposal.services.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-medium">Serviços e valores</h2>
          <ul className="mt-3 divide-y divide-border-subtle">
            {proposal.services.map((service) => (
              <li
                key={`${service.name}-${service.value}`}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{service.name}</p>
                  <p className="text-[12px] text-muted-foreground">{service.description}</p>
                </div>
                <p className="font-mono text-sm tabular-nums">
                  {formatCurrency(service.value)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total dos serviços</span>
            <span className="font-mono text-base font-medium tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>
        </section>
      ) : null}

      {(proposal.deadlineDays || proposal.validUntil || proposal.adBudgetSuggestion) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {proposal.deadlineDays ? (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-medium">Prazo</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Execução estimada em{" "}
                <strong className="font-medium text-foreground">
                  {proposal.deadlineDays} dias
                </strong>{" "}
                após kickoff.
              </p>
            </section>
          ) : null}
          {proposal.adBudgetSuggestion ? (
            <section className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-sm font-medium">Investimento sugerido em anúncios</h2>
              <p className="mt-2 font-mono text-lg tabular-nums">
                {formatCurrency(proposal.adBudgetSuggestion)}
                <span className="text-sm font-sans text-muted-foreground"> / mês</span>
              </p>
            </section>
          ) : null}
        </div>
      )}

      {proposal.validUntil ? (
        <p className="text-[12px] text-muted">
          Proposta válida até {formatDate(proposal.validUntil)}.
        </p>
      ) : null}

      {proposal.conditions.length > 0 ? (
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-medium">Condições comerciais</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {proposal.conditions.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-muted">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
