"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  adminPublishProposalAction,
  adminSaveProposalWizardAction,
} from "@/app/(workspace)/admin/actions";
import { ProposalFlowStepBody } from "@/app/components/proposal-flow-sections";
import { ProposalStepNav } from "@/app/components/proposal-step-nav";
import { defaultCommercialPayload } from "@/lib/commercial-defaults";
import {
  previewValidUntilIso,
  writeProposalPreviewCache,
} from "@/lib/proposal-preview-cache";
import type {
  ImplementationPlanStep,
  ProposalServiceLine,
  TrafficProposalView,
} from "@/lib/proposal-types";

type Props = {
  userId: string;
  clientEmail: string;
  clientName: string;
  defaultCompanyName?: string;
  defaultContactPhone?: string;
  initialProposal?: TrafficProposalView | null;
};

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/30";

function linesToText(lines: string[]) {
  return lines.join("\n");
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildViewFromDraft(
  userId: string,
  proposalId: string | undefined,
  client: {
    companyName: string;
    segment: string;
    goals: string;
    contactPhone: string;
    monthlyMediaBudget: number | null;
  },
  commercial: ReturnType<typeof defaultCommercialPayload>,
): TrafficProposalView {
  return {
    id: proposalId ?? "preview",
    userId,
    companyName: client.companyName,
    segment: client.segment,
    monthlyMediaBudget: client.monthlyMediaBudget,
    goals: client.goals,
    contactPhone: client.contactPhone,
    intro: commercial.intro,
    title: commercial.title,
    scope: commercial.scope,
    services: commercial.services,
    setupFee: commercial.setupFee,
    adBudgetSuggestion: commercial.adBudgetSuggestion,
    deadlineDays: commercial.deadlineDays,
    implementationPlan: commercial.implementationPlan,
    conditions: commercial.conditions,
    terms: commercial.terms,
    validUntil: previewValidUntilIso(),
    status: "sent",
    acceptedAt: null,
    createdAt: new Date().toISOString(),
  };
}

export function AdminProposalWizard({
  userId,
  clientEmail,
  clientName,
  defaultCompanyName = "",
  defaultContactPhone = "",
  initialProposal,
}: Props) {
  const router = useRouter();
  const defaults = useMemo(() => defaultCommercialPayload(), []);
  const [step, setStep] = useState(1);
  const [proposalId, setProposalId] = useState<string | undefined>(initialProposal?.id);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [companyName, setCompanyName] = useState(
    initialProposal?.companyName ?? defaultCompanyName,
  );
  const [segment, setSegment] = useState(initialProposal?.segment ?? "");
  const [goals, setGoals] = useState(initialProposal?.goals ?? "");
  const [contactPhone, setContactPhone] = useState(
    initialProposal?.contactPhone ?? defaultContactPhone,
  );
  const [monthlyMediaBudget, setMonthlyMediaBudget] = useState(
    initialProposal?.monthlyMediaBudget?.toString() ?? "",
  );

  const [title, setTitle] = useState(initialProposal?.title ?? defaults.title);
  const [intro, setIntro] = useState(initialProposal?.intro ?? defaults.intro);
  const [scopeText, setScopeText] = useState(
    linesToText(initialProposal?.scope ?? defaults.scope),
  );
  const [services, setServices] = useState<ProposalServiceLine[]>(
    initialProposal?.services.length ? initialProposal.services : defaults.services,
  );
  const [implementationPlan, setImplementationPlan] = useState<ImplementationPlanStep[]>(
    initialProposal?.implementationPlan.length
      ? initialProposal.implementationPlan
      : defaults.implementationPlan,
  );
  const [setupFee, setSetupFee] = useState(
    String(initialProposal?.setupFee ?? defaults.setupFee ?? ""),
  );
  const [adBudgetSuggestion, setAdBudgetSuggestion] = useState(
    String(initialProposal?.adBudgetSuggestion ?? defaults.adBudgetSuggestion ?? ""),
  );
  const [deadlineDays, setDeadlineDays] = useState(
    String(initialProposal?.deadlineDays ?? defaults.deadlineDays ?? ""),
  );
  const [conditionsText, setConditionsText] = useState(
    linesToText(initialProposal?.conditions ?? defaults.conditions),
  );
  const [termsText, setTermsText] = useState(
    linesToText(initialProposal?.terms ?? defaults.terms),
  );

  const commercial = useMemo(
    () => ({
      title,
      intro,
      scope: textToLines(scopeText),
      services,
      setupFee: setupFee.trim() ? Number.parseInt(setupFee, 10) : null,
      adBudgetSuggestion: adBudgetSuggestion.trim()
        ? Number.parseInt(adBudgetSuggestion, 10)
        : null,
      deadlineDays: deadlineDays.trim() ? Number.parseInt(deadlineDays, 10) : null,
      implementationPlan,
      conditions: textToLines(conditionsText),
      terms: textToLines(termsText),
    }),
    [
      title,
      intro,
      scopeText,
      services,
      setupFee,
      adBudgetSuggestion,
      deadlineDays,
      implementationPlan,
      conditionsText,
      termsText,
    ],
  );

  const previewProposal = buildViewFromDraft(
    userId,
    proposalId,
    {
      companyName,
      segment,
      goals,
      contactPhone,
      monthlyMediaBudget: monthlyMediaBudget.trim()
        ? Number.parseInt(monthlyMediaBudget, 10)
        : null,
    },
    commercial,
  );

  function saveDraft(then?: "publish") {
    setError(null);
    setMessage(null);
    if (!companyName.trim()) {
      setError("Informe o nome da empresa na etapa 1.");
      setStep(1);
      return;
    }

    startTransition(async () => {
      const result = await adminSaveProposalWizardAction({
        proposalId,
        userId,
        clientEmail,
        clientName,
        companyName,
        segment,
        goals,
        contactPhone,
        monthlyMediaBudget: monthlyMediaBudget.trim()
          ? Number.parseInt(monthlyMediaBudget, 10)
          : null,
        commercial,
      });

      if ("error" in result) {
        setError(result.error ?? "Não foi possível salvar.");
        return;
      }

      setProposalId(result.proposal.id);

      if (then !== "publish") {
        setMessage("Alterações salvas.");
        router.refresh();
        return;
      }

      if (then === "publish") {
        const sent = await adminPublishProposalAction(result.proposal.id);
        if ("error" in sent) {
          setError(sent.error ?? "Não foi possível enviar.");
          return;
        }
        setMessage(
          sent.emailSent
            ? "Proposta salva e e-mail enviado ao cliente."
            : `Proposta salva no banco. E-mail não enviado: ${sent.emailError ?? "falha no Resend."}`,
        );
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Proposta comercial — gestão de tráfego</h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Monte as seis etapas e envie para aceite em /propostas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            writeProposalPreviewCache(previewProposal);
            window.open("/admin/propostas/preview", "_blank", "noopener,noreferrer");
          }}
          className="group relative shrink-0 overflow-hidden rounded-full border border-foreground/10 bg-background/50 px-5 py-2 text-[12px] font-medium tracking-tight backdrop-blur-sm transition-all hover:border-foreground/30 hover:bg-background"
        >
          <span className="relative z-10 flex items-center gap-2">
            Abrir proposta
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <ProposalStepNav currentStep={step} onStepChange={setStep} interactive />

        <div className="min-w-0 space-y-5">
          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-[12px] font-medium text-muted-foreground">
                Título da proposta
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-[12px] font-medium text-muted-foreground">
                Apresentação
                <textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  rows={4}
                  className={fieldClass}
                />
              </label>
              <label className="block text-[12px] font-medium text-muted-foreground">
                Empresa (contratante)
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className={fieldClass}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-medium text-muted-foreground">
                  Segmento
                  <input
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-[12px] font-medium text-muted-foreground">
                  Contato (WhatsApp)
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="block text-[12px] font-medium text-muted-foreground">
                Objetivos comerciais
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={3}
                  className={fieldClass}
                />
              </label>
              <label className="block text-[12px] font-medium text-muted-foreground">
                Orçamento mensal em mídia informado (R$)
                <input
                  type="number"
                  min={0}
                  value={monthlyMediaBudget}
                  onChange={(e) => setMonthlyMediaBudget(e.target.value)}
                  className={fieldClass}
                />
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <label className="block text-[12px] font-medium text-muted-foreground">
                Escopo (um item por linha)
                <textarea
                  value={scopeText}
                  onChange={(e) => setScopeText(e.target.value)}
                  rows={10}
                  className={fieldClass}
                />
              </label>
              <div>
                <p className="text-[12px] font-medium text-muted-foreground">Serviços e valores</p>
                <ul className="mt-2 space-y-3">
                  {services.map((service, index) => (
                    <li
                      key={index}
                      className="grid gap-2 rounded-lg border border-border-subtle p-3 sm:grid-cols-[1fr_1fr_120px_auto]"
                    >
                      <input
                        value={service.name}
                        placeholder="Nome"
                        onChange={(e) => {
                          const next = [...services];
                          next[index] = { ...next[index], name: e.target.value };
                          setServices(next);
                        }}
                        className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                      />
                      <input
                        value={service.description}
                        placeholder="Descrição"
                        onChange={(e) => {
                          const next = [...services];
                          next[index] = { ...next[index], description: e.target.value };
                          setServices(next);
                        }}
                        className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={service.value}
                        onChange={(e) => {
                          const next = [...services];
                          next[index] = {
                            ...next[index],
                            value: Number.parseInt(e.target.value, 10) || 0,
                          };
                          setServices(next);
                        }}
                        className="rounded-md border border-border bg-background px-2 py-2 text-sm"
                      />
                      <button
                        type="button"
                        className="text-[12px] text-muted hover:text-negative"
                        onClick={() => setServices(services.filter((_, i) => i !== index))}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-2 text-[13px] underline underline-offset-2"
                  onClick={() =>
                    setServices([
                      ...services,
                      { name: "", description: "", value: 0 },
                    ])
                  }
                >
                  Adicionar serviço
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <p className="text-[12px] text-muted-foreground">
                Linha do tempo de implantação — ajuste títulos e descrições conforme o contrato.
              </p>
              <ul className="space-y-3">
                {implementationPlan.map((item, index) => (
                  <li
                    key={index}
                    className="space-y-2 rounded-lg border border-border-subtle p-3"
                  >
                    <input
                      value={item.title}
                      placeholder="Etapa"
                      onChange={(e) => {
                        const next = [...implementationPlan];
                        next[index] = { ...next[index], title: e.target.value };
                        setImplementationPlan(next);
                      }}
                      className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm font-medium"
                    />
                    <textarea
                      value={item.description}
                      rows={2}
                      placeholder="Descrição"
                      onChange={(e) => {
                        const next = [...implementationPlan];
                        next[index] = { ...next[index], description: e.target.value };
                        setImplementationPlan(next);
                      }}
                      className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                    />
                    <button
                      type="button"
                      className="text-[12px] text-muted hover:text-negative"
                      onClick={() =>
                        setImplementationPlan(implementationPlan.filter((_, i) => i !== index))
                      }
                    >
                      Remover etapa
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="text-[13px] underline underline-offset-2"
                onClick={() =>
                  setImplementationPlan([
                    ...implementationPlan,
                    { title: "", description: "" },
                  ])
                }
              >
                Adicionar etapa
              </button>
              <label className="block text-[12px] font-medium text-muted-foreground">
                Prazo total estimado (dias após kickoff)
                <input
                  type="number"
                  min={1}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(e.target.value)}
                  className={fieldClass}
                />
              </label>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-medium text-muted-foreground">
                  Taxa de implantação (R$)
                  <input
                    type="number"
                    min={0}
                    value={setupFee}
                    onChange={(e) => setSetupFee(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-[12px] font-medium text-muted-foreground">
                  Verba sugerida em anúncios / mês (R$)
                  <input
                    type="number"
                    min={0}
                    value={adBudgetSuggestion}
                    onChange={(e) => setAdBudgetSuggestion(e.target.value)}
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="block text-[12px] font-medium text-muted-foreground">
                Pagamento e cancelamento (um item por linha)
                <textarea
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  rows={8}
                  className={fieldClass}
                />
              </label>
              <p className="text-[12px] text-muted-foreground">
                A mensalidade da gestão é calculada pela soma dos serviços na etapa 2.
              </p>
            </div>
          ) : null}

          {step === 5 ? (
            <label className="block text-[12px] font-medium text-muted-foreground">
              Termos e responsabilidades (um item por linha)
              <textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                rows={12}
                className={fieldClass}
              />
            </label>
          ) : null}

          {step === 6 ? (
            <div className="space-y-4">
              <p className="text-[13px] text-muted-foreground">
                Revise o conteúdo como o cliente verá antes do aceite.
              </p>
              <ProposalFlowStepBody step={6} proposal={previewProposal} />
            </div>
          ) : null}

          {error ? <p className="text-[13px] text-negative">{error}</p> : null}
          {message ? <p className="text-[13px] text-positive">{message}</p> : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            <button
              type="button"
              disabled={step <= 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Anterior
            </button>
            <div className="flex flex-wrap gap-2">
              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(6, s + 1))}
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
                >
                  Próxima
                </button>
              ) : proposalId &&
                initialProposal &&
                (initialProposal.status === "sent" ||
                  initialProposal.status === "accepted") ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => saveDraft()}
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  {pending ? "Salvando..." : "Salvar alterações"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => saveDraft("publish")}
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
                >
                  {pending ? "Enviando..." : "Enviar ao cliente"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
