"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProposalClientFlow } from "@/app/components/proposal-client-flow";
import { PageHeader } from "@/app/components/page-header";
import { readProposalPreviewCache } from "@/lib/proposal-preview-cache";
import type { TrafficProposalView } from "@/lib/proposal-types";

export function AdminProposalPreviewFromCache() {
  const [proposal, setProposal] = useState<TrafficProposalView | null | undefined>(undefined);

  useEffect(() => {
    setProposal(readProposalPreviewCache());
  }, []);

  if (proposal === undefined) {
    return (
      <p className="text-sm font-light text-muted-foreground">Carregando…</p>
    );
  }

  if (!proposal) {
    return (
      <>
        <PageHeader
          title="Prévia da proposta"
          description="Nenhum rascunho em cache nesta aba."
        />
        <p className="mt-6 text-sm text-muted-foreground">
          Volte ao admin, monte a proposta e use{" "}
          <span className="font-medium text-foreground">Ver experiência do cliente</span> — a
          prévia grava o formulário no cache local e abre em nova aba — sem salvar rascunho.
        </p>
        <Link href="/admin" className="mt-4 inline-block text-[13px] underline underline-offset-2">
          Voltar ao admin
        </Link>
      </>
    );
  }

  return <ProposalClientFlow proposal={proposal} previewMode />;
}
