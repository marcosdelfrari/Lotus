import { formatCurrency, formatDate, formatShortDate } from "@/lib/format";
import {
  proposalTotalServices,
  type TrafficProposalView,
} from "@/lib/proposal-types";

function SlideHeader({
  index,
  category,
  title,
  subtitle,
  badge,
  hideBadgeOnMobile = false,
}: {
  index: string;
  category: string;
  title: string;
  subtitle?: string;
  badge?: string | null;
  hideBadgeOnMobile?: boolean;
}) {
  return (
    <header className="border-b border-white/7 pb-3.5 sm:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[9px] tracking-[0.18em] text-foreground/80 sm:px-2.5 sm:text-[10px] sm:tracking-[0.22em]">
            {index}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted sm:text-[10px] sm:tracking-[0.26em]">
            {category}
          </span>
        </div>
        {badge ? (
          <span
            className={`rounded-full border border-white/10 bg-white/3 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.18em] ${
              hideBadgeOnMobile ? "hidden sm:inline" : ""
            }`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <h2 className="mt-2.5 text-xl font-extralight tracking-[-0.02em] text-foreground sm:mt-4 sm:text-3xl lg:text-[34px] lg:leading-[1.15]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 max-w-2xl text-xs font-light leading-relaxed text-muted-foreground sm:mt-2 sm:text-[13px]">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}

export function ProposalStep1Content({ proposal }: { proposal: TrafficProposalView }) {
  const monthlyTotal = proposalTotalServices(proposal);

  return (
    <div className="flex h-full flex-col justify-between gap-5 sm:gap-8">
      <div className="space-y-2.5 sm:space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted sm:text-[10px] sm:tracking-[0.28em]">
              DOSSIÊ EXECUTIVO
            </span>
          </div>
          {proposal.validUntil ? (
            <span className="shrink-0 rounded-full border border-white/10 bg-white/3 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]">
              <span className="sm:hidden">Até {formatShortDate(proposal.validUntil)}</span>
              <span className="hidden sm:inline">
                Válida até {formatDate(proposal.validUntil)}
              </span>
            </span>
          ) : null}
        </div>

        <div className="space-y-1.5 sm:space-y-4 sm:pt-2">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px] sm:tracking-[0.24em]">
            <span className="sm:hidden">Para </span>
            <span className="hidden sm:inline">Preparado exclusivamente para </span>
            <span className="text-foreground">{proposal.companyName}</span>
          </p>
          <h2 className="max-w-3xl text-[22px] font-extralight leading-[1.18] tracking-[-0.03em] text-foreground sm:text-4xl sm:leading-[1.1] lg:text-[44px]">
            {proposal.title || "Gestão de Tráfego Pago & Performance Digital"}
          </h2>
          {proposal.intro ? (
            <p className="max-w-2xl pt-0.5 text-[13px] font-light leading-relaxed text-muted-foreground sm:pt-1 sm:text-[15px]">
              {proposal.intro}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {proposal.goals ? (
          <div className="rounded-xl border border-white/7 bg-white/2 px-3.5 py-3 sm:rounded-2xl sm:px-5 sm:py-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted sm:text-[10px] sm:tracking-[0.24em]">
              Diretriz Estratégica
            </p>
            <p className="mt-1 text-xs font-light leading-relaxed text-foreground/90 sm:mt-1.5 sm:text-sm">
              {proposal.goals}
            </p>
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/7 sm:rounded-2xl lg:grid-cols-4">
          <div className="bg-[#111111] px-3.5 py-2.5 sm:px-5 sm:py-4">
            <dt className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted sm:text-[9px] sm:tracking-[0.24em]">
              Contratante
            </dt>
            <dd className="mt-1 truncate text-xs font-medium text-foreground sm:mt-1.5 sm:text-sm">
              {proposal.companyName}
            </dd>
          </div>
          <div className="bg-[#111111] px-3.5 py-2.5 sm:px-5 sm:py-4">
            <dt className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted sm:text-[9px] sm:tracking-[0.24em]">
              Segmento
            </dt>
            <dd className="mt-1 truncate text-xs font-light text-foreground/85 sm:mt-1.5 sm:text-sm">
              {proposal.segment || "Performance & Aquisição"}
            </dd>
          </div>
          <div className="bg-[#111111] px-3.5 py-2.5 sm:px-5 sm:py-4">
            <dt className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted sm:text-[9px] sm:tracking-[0.24em]">
              Fee Mensal
            </dt>
            <dd className="mt-1 font-mono text-xs tabular-nums text-foreground sm:mt-1.5 sm:text-sm">
              {formatCurrency(monthlyTotal)}
              <span className="text-[10px] text-muted sm:text-[11px]">/mês</span>
            </dd>
          </div>
          <div className="bg-[#111111] px-3.5 py-2.5 sm:px-5 sm:py-4">
            <dt className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-muted sm:text-[9px] sm:tracking-[0.24em]">
              Ciclo / Contato
            </dt>
            <dd className="mt-1 truncate font-mono text-[11px] text-foreground/85 sm:mt-1.5 sm:text-xs">
              {proposal.deadlineDays
                ? `${proposal.deadlineDays} dias`
                : proposal.contactPhone || "Ativação imediata"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function ProposalStep2Content({ proposal }: { proposal: TrafficProposalView }) {
  const monthlyTotal = proposalTotalServices(proposal);

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <SlideHeader
        index="02"
        category="Arquitetura de Escopo"
        title="Entregáveis & Composição"
        subtitle="Frentes operacionais incluídas na gestão contínua e discriminação dos serviços."
        badge={`${proposal.scope.length} entregáveis`}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {proposal.scope.length > 0 ? (
          <div className="space-y-3 lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Escopo Operacional
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {proposal.scope.map((line, idx) => (
                <li
                  key={line}
                  className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/2 px-3.5 py-3 transition-colors hover:border-white/12"
                >
                  <span className="mt-0.5 font-mono text-[10px] tabular-nums text-muted">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[12.5px] font-light leading-snug text-foreground/90">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {proposal.services.length > 0 ? (
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/2.5 p-5 lg:col-span-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Serviços Integrados
              </p>
              <ul className="mt-4 divide-y divide-white/6">
                {proposal.services.map((service) => (
                  <li
                    key={`${service.name}-${service.value}`}
                    className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-foreground">{service.name}</p>
                      {service.description ? (
                        <p className="mt-0.5 text-[11px] font-light leading-relaxed text-muted-foreground">
                          {service.description}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-mono text-[13px] tabular-nums text-foreground">
                      {formatCurrency(service.value)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex items-baseline justify-between border-t border-white/8 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                Total Mensal
              </span>
              <span className="font-mono text-lg font-light tabular-nums text-foreground">
                {formatCurrency(monthlyTotal)}
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ProposalStep3Content({ proposal }: { proposal: TrafficProposalView }) {
  if (proposal.implementationPlan.length === 0) {
    return (
      <p className="text-sm font-light text-muted-foreground">
        Plano de implantação não informado.
      </p>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <SlideHeader
        index="03"
        category="Roadmap de Execução"
        title="Plano de Implantação"
        subtitle="Etapas estruturadas do kickoff à operação contínua de mídia e dados."
        badge={proposal.deadlineDays ? `Ciclo de ${proposal.deadlineDays} dias` : null}
      />

      <ol className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {proposal.implementationPlan.map((step, index) => (
          <li
            key={`${step.title}-${index}`}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/7 bg-white/2 p-4 transition-all hover:border-white/15 hover:bg-white/3.5 sm:p-5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-2xl font-extralight tabular-nums text-foreground/40 transition-colors group-hover:text-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-white/7" />
              </div>
              <p className="mt-4 text-[13.5px] font-medium leading-snug tracking-tight text-foreground">
                {step.title}
              </p>
              <p className="mt-2 text-[12px] font-light leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>

            <div className="mt-4 pt-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">
                Fase {index + 1}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProposalStep4Content({ proposal }: { proposal: TrafficProposalView }) {
  const monthlyTotal = proposalTotalServices(proposal);

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <SlideHeader
        index="04"
        category="Estrutura Financeira"
        title="Investimento & Condições"
        subtitle="Transparência total entre fee de gestão, setup inicial e verba direta de mídia."
      />

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <section className="relative overflow-hidden rounded-2xl border border-white/20 bg-linear-to-b from-white/7 to-white/2 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
                Mensalidade de Gestão
              </h3>
              <span className="rounded-full bg-foreground px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-background">
                Principal
              </span>
            </div>
            <p className="mt-4 font-mono text-2xl font-light tabular-nums tracking-tight text-foreground sm:text-3xl">
              {formatCurrency(monthlyTotal)}
              <span className="ml-1 font-sans text-xs font-light text-muted-foreground">/mês</span>
            </p>
            <p className="mt-2 text-[11.5px] font-light text-muted-foreground">
              Inclui operação completa + Lótus Analytics Pro
            </p>
          </section>

          <section className="rounded-2xl border border-white/7 bg-white/2 p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Taxa de Implantação
            </h3>
            <p className="mt-4 font-mono text-2xl font-light tabular-nums tracking-tight text-foreground sm:text-3xl">
              {proposal.setupFee != null && proposal.setupFee > 0
                ? formatCurrency(proposal.setupFee)
                : "Isento"}
            </p>
            <p className="mt-2 text-[11.5px] font-light text-muted-foreground">
              Pagamento único na ativação do contrato
            </p>
          </section>

          <section className="rounded-2xl border border-white/7 bg-white/2 p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Verba Sugerida (Mídia)
            </h3>
            <p className="mt-4 font-mono text-2xl font-light tabular-nums tracking-tight text-foreground sm:text-3xl">
              {proposal.adBudgetSuggestion
                ? formatCurrency(proposal.adBudgetSuggestion)
                : "Sob medida"}
              {proposal.adBudgetSuggestion ? (
                <span className="ml-1 font-sans text-xs font-light text-muted-foreground">
                  /mês
                </span>
              ) : null}
            </p>
            <p className="mt-2 text-[11.5px] font-light text-muted-foreground">
              Pago direto ao Google Ads e Meta Ads
            </p>
          </section>
        </div>

        {proposal.conditions.length > 0 ? (
          <section className="rounded-2xl border border-white/7 bg-white/1.5 p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Regras de Faturamento e Cancelamento
            </h3>
            <ul className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
              {proposal.conditions.map((line, idx) => (
                <li
                  key={line}
                  className="flex items-start gap-2.5 text-[12.5px] font-light leading-relaxed text-muted-foreground"
                >
                  <span className="mt-0.5 font-mono text-[10px] text-foreground/50">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export function ProposalStep5Content({ proposal }: { proposal: TrafficProposalView }) {
  if (proposal.terms.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Termos não informados nesta proposta.</p>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <SlideHeader
        index="05"
        category="Governança & Compliance"
        title="Termos e Responsabilidades"
        subtitle="Premissas contratuais objetivas para segurança de ambas as partes."
        badge={`${proposal.terms.length} cláusulas`}
      />

      <ul className="grid gap-3 sm:grid-cols-2">
        {proposal.terms.map((line, index) => (
          <li
            key={line}
            className="flex items-start gap-3.5 rounded-2xl border border-white/7 bg-white/2 p-4"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/3 font-mono text-[10px] tabular-nums text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[12.5px] font-light leading-relaxed text-foreground/85">
              {line}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProposalStep6Review({
  proposal,
  onJumpToStep,
}: {
  proposal: TrafficProposalView;
  onJumpToStep?: (step: number) => void;
}) {
  const monthlyTotal = proposalTotalServices(proposal);

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <SlideHeader
        index="06"
        category="Síntese Executiva"
        title="Resumo & Formalização"
        subtitle="Quadro consolidado da proposta comercial antes da assinatura digital."
        badge={proposal.companyName}
        hideBadgeOnMobile
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/8 bg-white/2 p-3 sm:rounded-2xl sm:p-4">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted sm:text-[9px] sm:tracking-[0.22em]">
            Mensalidade Gestão
          </p>
          <p className="mt-1.5 font-mono text-base font-light tabular-nums text-foreground sm:mt-2 sm:text-xl">
            {formatCurrency(monthlyTotal)}
            <span className="text-[10px] text-muted sm:text-xs">/mês</span>
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-[11px]">
            {proposal.services.length} serviços incluídos
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/2 p-3 sm:rounded-2xl sm:p-4">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted sm:text-[9px] sm:tracking-[0.22em]">
            Setup Inicial
          </p>
          <p className="mt-1.5 font-mono text-base font-light tabular-nums text-foreground sm:mt-2 sm:text-xl">
            {proposal.setupFee != null && proposal.setupFee > 0
              ? formatCurrency(proposal.setupFee)
              : "Isento"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-[11px]">
            Taxa única de ativação
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/2 p-3 sm:rounded-2xl sm:p-4">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted sm:text-[9px] sm:tracking-[0.22em]">
            Verba de Mídia
          </p>
          <p className="mt-1.5 font-mono text-base font-light tabular-nums text-foreground sm:mt-2 sm:text-xl">
            {proposal.adBudgetSuggestion
              ? formatCurrency(proposal.adBudgetSuggestion)
              : "Sob medida"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-[11px]">
            Google Ads & Meta Ads
          </p>
        </div>

        <div className="rounded-xl border border-white/8 bg-white/2 p-3 sm:rounded-2xl sm:p-4">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted sm:text-[9px] sm:tracking-[0.22em]">
            Implantação & Bônus
          </p>
          <p className="mt-1.5 font-mono text-base font-light tabular-nums text-foreground sm:mt-2 sm:text-xl">
            {proposal.deadlineDays ? `${proposal.deadlineDays} dias` : "Imediato"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-[11px]">
            Kickoff e onboarding inclusos
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/7 bg-white/1.5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Escopo Contratado
            </p>
            {onJumpToStep ? (
              <button
                type="button"
                onClick={() => onJumpToStep(2)}
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Ver escopo
              </button>
            ) : null}
          </div>
          <ul className="mt-3 space-y-1.5 text-[12px] font-light text-foreground/85">
            {proposal.scope.slice(0, 4).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-muted">·</span>
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {proposal.scope.length > 4 ? (
              <li className="text-[11px] text-muted">
                + {proposal.scope.length - 4} entregáveis detalhados no escopo
              </li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/7 bg-white/1.5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Diretrizes & Governança
            </p>
            {onJumpToStep ? (
              <button
                type="button"
                onClick={() => onJumpToStep(5)}
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Ver termos
              </button>
            ) : null}
          </div>
          <ul className="mt-3 space-y-1.5 text-[12px] font-light text-foreground/85">
            {proposal.conditions.slice(0, 2).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-muted">·</span>
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
            {proposal.terms.slice(0, 2).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-muted">·</span>
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProposalFlowStepBody({
  step,
  proposal,
  onJumpToStep,
}: {
  step: number;
  proposal: TrafficProposalView;
  onJumpToStep?: (step: number) => void;
}) {
  switch (step) {
    case 1:
      return <ProposalStep1Content proposal={proposal} />;
    case 2:
      return <ProposalStep2Content proposal={proposal} />;
    case 3:
      return <ProposalStep3Content proposal={proposal} />;
    case 4:
      return <ProposalStep4Content proposal={proposal} />;
    case 5:
      return <ProposalStep5Content proposal={proposal} />;
    case 6:
      return <ProposalStep6Review proposal={proposal} onJumpToStep={onJumpToStep} />;
    default:
      return null;
  }
}
