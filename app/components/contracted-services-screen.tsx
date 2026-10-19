"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandMark } from "@/app/components/brand-mark";
import { LOTUS_ANALYTICS_URL } from "@/lib/analytics-app";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  proposalTotalServices,
  type TrafficProposalView,
} from "@/lib/proposal-types";

export function ContractedServicesScreen({
  proposal,
}: {
  proposal: TrafficProposalView;
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/8 bg-[#111111]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3.5">
          <BrandMark compact href="/" />
          <span className="text-white/15">/</span>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-positive">
              Plano ativo
            </span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden max-w-xs truncate text-xs font-medium text-foreground sm:inline">
              {proposal.companyName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/servicos/contrato"
            className="rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-[11px] font-light text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
          >
            Ver contrato assinado
          </Link>
          <a
            href={LOTUS_ANALYTICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Lótus Analytics
            <span aria-hidden>↗</span>
          </a>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-6 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-10">
        <div className="border-b border-white/8 pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted">
            Serviços contratados
          </p>
          <h1 className="mt-3 max-w-2xl text-2xl font-extralight tracking-tight text-foreground sm:text-4xl">
            Sua operação com a{" "}
            <span className="font-normal text-white">Lótus</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
            Gestão de tráfego e serviços vinculados à proposta aceita por{" "}
            <strong className="font-medium text-foreground">{proposal.companyName}</strong>.
            {acceptedLabel ? (
              <>
                {" "}
                Aceite registrado em{" "}
                <span className="text-foreground">{acceptedLabel}</span>.
              </>
            ) : null}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/2.5 p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Itens do contrato
              </p>
              {proposal.services.length > 0 ? (
                <ul className="mt-4 divide-y divide-white/6">
                  {proposal.services.map((service) => (
                    <li
                      key={`${service.name}-${service.value}`}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        {service.description ? (
                          <p className="mt-1 text-xs font-light leading-relaxed text-muted-foreground">
                            {service.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 font-mono text-sm tabular-nums text-foreground">
                        {formatCurrency(service.value)}
                        <span className="text-[10px] font-normal text-muted">/mês</span>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm font-light text-muted-foreground">
                  Nenhum serviço detalhado na proposta. Consulte o contrato completo.
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-t border-white/8 pt-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Total mensal de gestão
                </span>
                <span className="font-mono text-xl font-light tabular-nums text-foreground">
                  {formatCurrency(monthlyTotal)}
                </span>
              </div>

              {proposal.setupFee != null && proposal.setupFee > 0 ? (
                <p className="mt-3 text-xs font-light text-muted-foreground">
                  Taxa de setup (única):{" "}
                  <span className="font-mono text-foreground">
                    {formatCurrency(proposal.setupFee)}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">
                Proposta comercial
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {proposal.title || "Gestão de tráfego pago"}
              </p>
              {proposal.scope.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {proposal.scope.slice(0, 4).map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-xs font-light leading-snug text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-positive" />
                      {line}
                    </li>
                  ))}
                  {proposal.scope.length > 4 ? (
                    <li className="text-[11px] text-muted">
                      + {proposal.scope.length - 4} itens no contrato completo
                    </li>
                  ) : null}
                </ul>
              ) : null}
              <Link
                href="/servicos/contrato"
                className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/4 px-4 py-2.5 text-[11px] font-medium tracking-wide text-foreground transition-colors hover:border-white/25 hover:bg-white/6"
              >
                Abrir dossiê da proposta →
              </Link>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/1.5 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                Suporte
              </p>
              <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">
                Dúvidas sobre escopo ou faturamento? Fale com nosso time pelo WhatsApp cadastrado na
                proposta
                {proposal.contactPhone ? (
                  <>
                    {" "}
                    (<span className="font-mono text-foreground">{proposal.contactPhone}</span>)
                  </>
                ) : null}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
