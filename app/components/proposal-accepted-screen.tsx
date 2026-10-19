"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BrandMark } from "@/app/components/brand-mark";
import { BenefitsLeadsChart } from "@/app/components/lotus/benefits-leads-chart";
import { LOTUS_ANALYTICS_URL } from "@/lib/analytics-app";
import { formatCurrency } from "@/lib/format";
import {
  proposalTotalServices,
  type TrafficProposalView,
} from "@/lib/proposal-types";

const analyticsSeries = [
  {
    id: "google",
    name: "Google Ads",
    value: "186",
    logo: "/google-ads-icon.webp",
    logoWidth: 16,
    logoHeight: 16,
    tone: "text-google-yellow",
    stroke: "#fbbc04",
    fill: "rgba(251, 188, 4, 0.1)",
    shell:
      "border-google-yellow/25 bg-background/60 bg-gradient-to-br from-google-yellow/20 via-google-yellow/10 to-transparent shadow-[inset_0_1px_0_rgba(251,188,4,0.28)]",
    points: [22, 26, 24, 34, 30, 41, 38],
  },
  {
    id: "meta",
    name: "Meta Ads",
    value: "214",
    logo: "/META.webp",
    logoWidth: 24,
    logoHeight: 16,
    tone: "text-meta",
    stroke: "#0668e1",
    fill: "rgba(6, 104, 225, 0.1)",
    shell:
      "border-meta/25 bg-background/60 bg-gradient-to-br from-meta/20 via-meta/10 to-transparent shadow-[inset_0_1px_0_rgba(6,104,225,0.28)]",
    points: [18, 24, 29, 27, 36, 33, 42],
  },
  {
    id: "custom",
    name: "Rastreados",
    value: "96",
    logo: null,
    logoWidth: 0,
    logoHeight: 0,
    tone: "text-positive",
    stroke: "#4ade80",
    fill: "rgba(74, 222, 128, 0.08)",
    shell:
      "border-positive/25 bg-background/60 bg-gradient-to-br from-positive/20 via-positive/10 to-transparent shadow-[inset_0_1px_0_rgba(74,222,128,0.28)]",
    points: [8, 11, 9, 14, 12, 16, 15],
  },
];

const analyticsPillars = [
  {
    tag: "01 · RASTREAMENTO PROPRIETÁRIO",
    title: "De onde veio cada centavo investido",
    description:
      "Um script leve no seu site conecta cada visita, clique no WhatsApp e formulário exatamente ao anúncio e à campanha que trouxe o cliente.",
  },
  {
    tag: "02 · VISÃO UNIFICADA",
    title: "Google Ads e Meta Ads sem ponto cego",
    description:
      "Cruze investimento em mídia com leads reais no mesmo período. Veja na hora qual canal traz retorno e onde o custo por lead está mais eficiente.",
  },
  {
    tag: "03 · ZERO ACHISMO",
    title: "Fim dos prints soltos de fim de mês",
    description:
      "Painel vivo 24/7 para acompanhar a operação com transparência cirúrgica. Quando o dado é claro, a escala deixa de ser sorte e vira método.",
  },
];

export function ProposalAcceptedScreen({
  proposal,
  emailWarning,
  onReviewProposal,
}: {
  proposal: TrafficProposalView;
  emailWarning?: string | null;
  onReviewProposal?: () => void;
}) {
  const monthlyTotal = proposalTotalServices(proposal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Top Status Bar */}
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
              Proposta Aceita
            </span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden max-w-xs truncate text-xs font-medium text-foreground sm:inline">
              {proposal.companyName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onReviewProposal ? (
            <button
              type="button"
              onClick={onReviewProposal}
              className="rounded-full border border-white/10 bg-white/3 px-4 py-1.5 text-[11px] font-light text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
            >
              Revisar dossiê da proposta
            </button>
          ) : null}
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

      {/* Main Celebration & Merchandising Stage */}
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-6 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-10 lg:p-12">
        {/* Ambient Glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-positive/8 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/4 blur-3xl"
        />

        <div className="relative z-10 space-y-12">
          {/* Hero Thank You Section */}
          <div className="grid gap-8 border-b border-white/8 pb-10 lg:grid-cols-12 lg:items-end">
            <div className="space-y-5 lg:col-span-8">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-positive/30 bg-positive/10 px-3.5 py-1">
                <span className="text-xs text-positive">✓</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-positive">
                  Obrigado pela confiança · Operação iniciada
                </span>
              </div>

              <h1 className="max-w-3xl text-3xl font-extralight leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[52px]">
                Daqui pra frente, anúncio deixa de ser aposta e{" "}
                <span className="font-normal text-white">
                  vira máquina de aquisição.
                </span>
              </h1>

              <p className="max-w-2xl text-sm font-light leading-relaxed text-muted-foreground sm:text-base">
                Obrigado por escolher a <strong className="font-medium text-foreground">Lótus</strong>{" "}
                para comandar o tráfego da{" "}
                <strong className="font-medium text-foreground">{proposal.companyName}</strong>.
                Seu aceite digital já foi registrado e nossa equipe iniciou a preparação do seu
                onboarding, estrutura de campanhas e inteligência de dados.
              </p>

              {emailWarning ? (
                <p className="rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-xs font-light text-muted-foreground">
                  {emailWarning}
                </p>
              ) : null}
            </div>

            {/* Quick Contract Digest Card */}
            <div className="rounded-2xl border border-white/8 bg-white/2.5 p-5 lg:col-span-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">
                Resumo da Contratação
              </p>
              <dl className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
                  <dt className="font-light text-muted-foreground">Contratante</dt>
                  <dd className="font-medium text-foreground">{proposal.companyName}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
                  <dt className="font-light text-muted-foreground">Gestão Mensal</dt>
                  <dd className="font-mono text-foreground">{formatCurrency(monthlyTotal)}/mês</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-light text-muted-foreground">Acesso Lótus Analytics</dt>
                  <dd className="inline-flex items-center gap-1.5 font-mono text-[11px] text-positive">
                    <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                    Liberado
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Lótus Analytics Merchandising Showcase */}
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-br from-white/6 via-[#131313] to-[#0c0c0c] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-foreground px-3 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-background">
                    Exclusivo Cliente Lótus
                  </span>
                  <span className="rounded-full border border-white/12 bg-white/4 px-3 py-1 font-mono text-[10px] tracking-wider text-muted-foreground">
                    analytics.marcosdelfrari.com
                  </span>
                </div>

                <div className="space-y-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
                    LÓTUS ANALYTICS · SEU NOVO CENTRO DE COMANDO
                  </p>
                  <h2 className="text-2xl font-light leading-[1.12] tracking-tight text-foreground sm:text-4xl">
                    Quem controla o dado, domina o mercado.{" "}
                    <span className="text-muted-foreground">
                      Chega de gerenciar tráfego no escuro.
                    </span>
                  </h2>
                </div>

                <p className="max-w-xl text-sm font-light leading-relaxed text-muted-foreground sm:text-[15px]">
                  Enquanto agências comuns entregam PDFs estáticos uma vez por mês, sua conta já
                  nasce plugada no{" "}
                  <strong className="font-medium text-foreground">Lótus Analytics</strong>. Veja
                  em tempo real quanto entrou de mídia no Google e no Meta, quais campanhas
                  trouxeram visitas reais e exatamente qual anúncio gerou cada clique no seu
                  WhatsApp.
                </p>

                {/* Primary CTA to analytics.marcosdelfrari.com */}
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  <a
                    href={LOTUS_ANALYTICS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 rounded-full bg-foreground px-7 py-4 text-xs font-medium tracking-wide text-background shadow-[0_0_40px_-10px_rgba(255,255,255,0.45)] transition-all hover:opacity-95 active:scale-[0.99] sm:text-sm"
                  >
                    <span>Acessar Lótus Analytics agora</span>
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>

                  <a
                    href={LOTUS_ANALYTICS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 font-mono text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    analytics.marcosdelfrari.com ↗
                  </a>
                </div>
              </div>

              {/* Right Column: Live Analytics Preview Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0d0d]/90 p-5 shadow-2xl lg:col-span-5">
                <div className="flex items-center justify-between border-b border-white/7 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-positive" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/90">
                      Telemetria de Aquisição
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted">
                    Tempo real · 7d
                  </span>
                </div>

                <div className="my-5">
                  <BenefitsLeadsChart
                    series={analyticsSeries.map(({ id, stroke, fill, points }) => ({
                      id,
                      stroke,
                      fill,
                      points,
                    }))}
                  />
                </div>

                <ul className="grid grid-cols-3 gap-2">
                  {analyticsSeries.map((item) => (
                    <li
                      key={item.id}
                      className={`min-w-0 rounded-xl border px-2.5 py-2.5 sm:px-3 ${item.shell}`}
                    >
                      <div className="flex items-center gap-1.5">
                        {item.logo ? (
                          <Image
                            src={item.logo}
                            alt=""
                            width={item.logoWidth}
                            height={item.logoHeight}
                            className="h-3.5 w-auto shrink-0 mix-blend-lighten"
                          />
                        ) : (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-positive"
                            aria-hidden
                          />
                        )}
                        <p className={`truncate text-[10px] font-medium ${item.tone}`}>
                          {item.name}
                        </p>
                      </div>
                      <p className="mt-1.5 font-mono text-base tabular-nums text-foreground">
                        {item.value}
                      </p>
                      <p className="text-[9px] uppercase tracking-wider text-muted">
                        Conversões
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3 Merchandising Pillars */}
            <div className="mt-8 grid gap-4 border-t border-white/8 pt-8 sm:grid-cols-3">
              {analyticsPillars.map((pillar) => (
                <div
                  key={pillar.tag}
                  className="rounded-2xl border border-white/7 bg-white/2 p-4 sm:p-5"
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                    {pillar.tag}
                  </p>
                  <h3 className="mt-2.5 text-sm font-medium tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-light leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Strip: Próximos Passos */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/7 bg-white/1.5 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                PRÓXIMO PASSO
              </span>
              <span className="text-white/20">·</span>
              <p className="text-xs font-light text-muted-foreground">
                Nosso time entrará em contato para o kickoff e instalação do script do{" "}
                <span className="text-foreground">Lótus Analytics</span> no seu site.
              </p>
            </div>
            {onReviewProposal ? (
              <button
                type="button"
                onClick={onReviewProposal}
                className="shrink-0 text-left font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground underline underline-offset-4 hover:text-foreground sm:text-right"
              >
                Consultar escopo assinado →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
