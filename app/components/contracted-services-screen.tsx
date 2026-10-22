"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ServicosTopBar } from "@/app/components/servicos-top-bar";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  proposalTotalServices,
  type TrafficProposalView,
} from "@/lib/proposal-types";
import { LOTUS_WHATSAPP_LABEL, LOTUS_WHATSAPP_URL } from "@/lib/whatsapp";

export function ContractedServicesScreen({
  proposal,
  pendingBillingCount = 0,
  hasMarketingPlan = false,
}: {
  proposal: TrafficProposalView;
  pendingBillingCount?: number;
  hasMarketingPlan?: boolean;
}) {
  const monthlyTotal = proposalTotalServices(proposal);
  const acceptedLabel = proposal.acceptedAt
    ? formatDate(proposal.acceptedAt)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <ServicosTopBar companyName={proposal.companyName} />

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-6 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-10">
        <div className="border-b border-white/8 pb-6 sm:pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted">
            Dashboard · Operação contratada
          </p>
          <h1 className="mt-3 max-w-2xl text-2xl font-extralight tracking-tight text-foreground sm:text-4xl">
            Sua operação com a{" "}
            <span className="font-normal text-white">Lótus</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
            Gestão de tráfego para{" "}
            <strong className="font-medium text-foreground">
              {proposal.companyName}
            </strong>
            {acceptedLabel ? (
              <>
                {" "}
                · aceite em{" "}
                <span className="text-foreground">{acceptedLabel}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/servicos/financeiro"
            className="group rounded-2xl border border-white/10 bg-white/2.5 p-5 transition-colors hover:border-white/25"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Financeiro
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {pendingBillingCount > 0
                ? `${pendingBillingCount} cobrança(s) em aberto`
                : "Implantação e mensalidades"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Abrir faturamento →
            </p>
          </Link>

          <Link
            href="/servicos/marketing"
            className="group rounded-2xl border border-white/10 bg-white/2.5 p-5 transition-colors hover:border-white/25"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Marketing
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {hasMarketingPlan
                ? "Plano da operação publicado"
                : "Plano e funil da operação"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Proprietário edita · usuário consulta →
            </p>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-white/10 bg-white/2.5 p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                  Serviços do contrato
                </p>
                <p className="font-mono text-lg font-light tabular-nums text-foreground">
                  {formatCurrency(monthlyTotal)}
                  <span className="text-[11px] font-normal text-muted"> /mês</span>
                </p>
              </div>

              {proposal.services.length > 0 ? (
                <ul className="mt-5 divide-y divide-white/6">
                  {proposal.services.map((service) => (
                    <li
                      key={`${service.name}-${service.value}`}
                      className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {service.name}
                        </p>
                        {service.description ? (
                          <p className="mt-1 text-xs font-light leading-relaxed text-muted-foreground">
                            {service.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                        {formatCurrency(service.value)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm font-light text-muted-foreground">
                  Nenhum serviço detalhado. Consulte o contrato completo.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">
                Documentos
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {proposal.title || "Gestão de tráfego pago"}
              </p>
              {proposal.scope.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {proposal.scope.slice(0, 3).map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-[11px] font-light leading-snug text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                      <span className="line-clamp-2">{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link
                href="/servicos/contrato"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/4 px-4 py-2.5 text-[11px] font-medium tracking-wide text-foreground transition-colors hover:border-white/25 hover:bg-white/6"
              >
                Dossiê da proposta
              </Link>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/1.5 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                Ajuda
              </p>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                Escopo, prazos ou pagamento — fale no WhatsApp{" "}
                <a
                  href={LOTUS_WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-foreground underline-offset-2 hover:underline"
                >
                  {proposal.contactPhone || LOTUS_WHATSAPP_LABEL}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
