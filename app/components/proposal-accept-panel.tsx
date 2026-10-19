"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { acceptProposalAction } from "@/app/(workspace)/propostas/actions";
import { ProposalSummary } from "@/app/components/proposal-summary";
import { analyticsDashboardUrl } from "@/lib/analytics-app";
import type { TrafficProposalView } from "@/lib/proposal-types";

export function ProposalAcceptPanel({
  proposal,
  planAlreadyActive,
}: {
  proposal: TrafficProposalView;
  planAlreadyActive: boolean;
}) {
  const [accepted, setAccepted] = useState(proposal.status === "accepted");
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [pending, startTransition] = useTransition();

  if (accepted || proposal.status === "accepted") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-positive/30 bg-positive/5 p-5">
          <p className="font-medium text-positive">Proposta aceita</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Seu Plano Pro no Lótus Analytics está ativo no cadastro compartilhado. A equipe
            entrará em contato para o kickoff de tráfego pago.
          </p>
          <Link
            href={analyticsDashboardUrl()}
            className="mt-4 inline-flex rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Abrir painel Analytics
          </Link>
        </div>
        <ProposalSummary proposal={proposal} />
      </div>
    );
  }

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
    <div className="space-y-6">
      {planAlreadyActive ? (
        <p className="rounded-lg border border-border-subtle bg-surface px-4 py-3 text-[13px] text-muted-foreground">
          Você já possui Plano Pro ativo; ao aceitar, registramos a contratação de tráfego
          pago.
        </p>
      ) : null}

      <ProposalSummary proposal={proposal} />

      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-foreground"
          />
          <span className="text-[13px] leading-6 text-muted-foreground">
            Li e aceito escopo, valores, condições e investimento sugerido em mídia. Autorizo
            a ativação do Plano Pro no Lótus Analytics vinculado ao meu e-mail.
          </span>
        </label>

        {error ? <p className="mt-3 text-[13px] text-negative">{error}</p> : null}

        <button
          type="button"
          disabled={!terms || pending}
          className="mt-5 w-full rounded-md bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-40"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await acceptProposalAction(proposal.id);
              if ("error" in result) {
                setError(result.error ?? "Não foi possível aceitar.");
                return;
              }
              setAccepted(true);
            });
          }}
        >
          {pending ? "Registrando aceite..." : "Aceitar proposta e ativar Plano Pro"}
        </button>
      </div>
    </div>
  );
}
