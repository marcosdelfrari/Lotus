"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AD_FORMAT_OPTIONS,
  FUNNEL_TOUCHPOINT_OPTIONS,
  OPERATION_PROPOSAL_OPTIONS,
  PAID_PLATFORM_OPTIONS,
  proposalToPlanFields,
  type MarketingPlanFields,
} from "@/lib/campaign-marketing-options";
import type { MarketingPlanView } from "@/lib/marketing-plans-store";
import type { OrgAccessRole } from "@/lib/org-roles";
import { canEditMarketingPlan, marketingRoleLabel } from "@/lib/org-roles";
import { formatDate } from "@/lib/format";
import type { ClientCompanyOption } from "@/lib/client-companies-store";

function groupOptions(options: { group?: string; id: string }[]) {
  const map = new Map<string, typeof AD_FORMAT_OPTIONS>();
  for (const option of options) {
    const group = option.group ?? "Geral";
    const list = map.get(group) ?? [];
    list.push(option as (typeof AD_FORMAT_OPTIONS)[number]);
    map.set(group, list);
  }
  return [...map.entries()];
}

function fieldsFromPlan(plan: MarketingPlanView | null | undefined) {
  if (!plan) {
    return {
      operationProposal: "",
      funnelTouchpoints: [] as string[],
      mediaChannels: [] as string[],
      adFormats: [] as string[],
      notes: "",
    };
  }
  const f = proposalToPlanFields({
    operationProposal: plan.operationProposal,
    funnelTouchpoints: plan.funnelTouchpoints,
    mediaChannels: plan.mediaChannels,
    adFormats: plan.adFormats,
    campaignPurpose: plan.operationProposal,
    acquisitionFlow: "",
    campaignTypes: plan.adFormats,
    notes: plan.notes,
  });
  return {
    operationProposal: f.operationProposal,
    funnelTouchpoints: f.funnelTouchpoints,
    mediaChannels: f.mediaChannels,
    adFormats: f.adFormats,
    notes: f.notes,
  };
}

function plansToMap(plans: MarketingPlanView[], seed?: MarketingPlanView | null) {
  const map = new Map<string, MarketingPlanView>();
  for (const plan of plans) {
    map.set(plan.analyticsCompanyId, plan);
  }
  if (seed) {
    map.set(seed.analyticsCompanyId, seed);
  }
  return map;
}

function PlanSummary({ plan }: { plan: MarketingPlanView }) {
  return (
    <dl className="mt-4 grid gap-3 text-[12px] sm:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">Proposta da operação</dt>
        <dd className="font-medium">{plan.operationProposalLabel}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-muted-foreground">Funil / jornada</dt>
        <dd className="font-medium">{plan.funnelTouchpointLabels.join(" · ")}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-muted-foreground">Plataformas</dt>
        <dd className="font-medium">{plan.mediaChannelLabels.join(" · ")}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-muted-foreground">Tipos de anúncio</dt>
        <dd className="font-medium">{plan.adFormatLabels.join(" · ")}</dd>
      </div>
      {plan.notes ? (
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Observações</dt>
          <dd className="text-muted-foreground">{plan.notes}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function MarketingPlanPanel({
  role,
  proposalId,
  proposalCompanyName,
  companies,
  initialPlan = null,
  savedPlans = [],
  clientListLayout = false,
  onSave,
}: {
  role: OrgAccessRole;
  proposalId: string;
  proposalCompanyName: string;
  companies: ClientCompanyOption[];
  initialPlan?: MarketingPlanView | null;
  savedPlans?: MarketingPlanView[];
  clientListLayout?: boolean;
  onSave: (input: {
    proposalId: string;
    analyticsCompanyId: string;
    plan: MarketingPlanFields;
  }) => Promise<{ error?: string; plan?: MarketingPlanView }>;
}) {
  const canEdit = canEditMarketingPlan(role);

  const defaultCompanyId = useMemo(() => {
    const match = companies.find(
      (c) =>
        c.name.trim().toLowerCase() === proposalCompanyName.trim().toLowerCase(),
    );
    return initialPlan?.analyticsCompanyId ?? match?.id ?? companies[0]?.id ?? "";
  }, [companies, initialPlan?.analyticsCompanyId, proposalCompanyName]);

  const initialFields = fieldsFromPlan(initialPlan);

  const [plansByCompanyId, setPlansByCompanyId] = useState(() =>
    plansToMap(savedPlans, initialPlan),
  );
  const [formOpen, setFormOpen] = useState(!clientListLayout);
  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [operationProposal, setOperationProposal] = useState(
    initialFields.operationProposal,
  );
  const [funnelTouchpoints, setFunnelTouchpoints] = useState<string[]>(
    initialFields.funnelTouchpoints,
  );
  const [mediaChannels, setMediaChannels] = useState<string[]>(
    initialFields.mediaChannels,
  );
  const [adFormats, setAdFormats] = useState<string[]>(initialFields.adFormats);
  const [notes, setNotes] = useState(initialFields.notes);
  const [saved, setSaved] = useState<MarketingPlanView | null>(initialPlan);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const funnelGroups = useMemo(() => groupOptions(FUNNEL_TOUCHPOINT_OPTIONS), []);
  const adGroups = useMemo(() => groupOptions(AD_FORMAT_OPTIONS), []);

  function toggle(list: string[], id: string, setter: (v: string[]) => void) {
    setter(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function applyFieldsForCompany(targetCompanyId: string) {
    const plan = plansByCompanyId.get(targetCompanyId) ?? null;
    const fields = fieldsFromPlan(plan);
    setCompanyId(targetCompanyId);
    setOperationProposal(fields.operationProposal);
    setFunnelTouchpoints(fields.funnelTouchpoints);
    setMediaChannels(fields.mediaChannels);
    setAdFormats(fields.adFormats);
    setNotes(fields.notes);
    setSaved(plan);
    setError(null);
  }

  function openEditor(targetCompanyId: string) {
    applyFieldsForCompany(targetCompanyId);
    setFormOpen(true);
  }

  function openNewPlan() {
    const withoutPlan = companies.find((c) => !plansByCompanyId.has(c.id));
    openEditor(withoutPlan?.id ?? companies[0]?.id ?? "");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await onSave({
        proposalId,
        analyticsCompanyId: companyId,
        plan: {
          operationProposal,
          funnelTouchpoints,
          mediaChannels,
          adFormats,
          notes,
          customAssets: "",
        },
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.plan) {
        setSaved(result.plan);
        setPlansByCompanyId((prev) => {
          const next = new Map(prev);
          next.set(result.plan!.analyticsCompanyId, result.plan!);
          return next;
        });
        setMessage("Plano de marketing salvo.");
        if (clientListLayout) {
          setFormOpen(false);
        }
      }
    });
  }

  const showEditor = canEdit && (!clientListLayout || formOpen);
  const showCompanyList = clientListLayout && (!canEdit || !formOpen);

  if (companies.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-surface p-5 text-[13px] text-muted-foreground">
        Nenhuma empresa vinculada no Analytics para este login. A Lótus usa a
        empresa só como referência de organização; o plano fica salvo na Lótus.
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Plano de marketing</h2>
          <p className="mt-1 max-w-2xl text-[12px] text-muted-foreground">
            Proposta da operação, funil (landing, presell, WhatsApp…), canais e
            tipos de anúncio — por empresa. Papel:{" "}
            <span className="text-foreground">{marketingRoleLabel(role)}</span>.
            {!canEdit
              ? " Você só consulta o plano definido pela Lótus ou pelo proprietário."
              : null}
          </p>
        </div>
        {!clientListLayout && saved ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-positive">
            Salvo · {formatDate(saved.updatedAt)}
          </p>
        ) : null}
      </div>

      {message && clientListLayout && !formOpen ? (
        <p className="mt-3 text-[13px] text-positive">{message}</p>
      ) : null}

      {showCompanyList ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Empresas cadastradas
            </p>
            {canEdit ? (
              <button
                type="button"
                onClick={openNewPlan}
                className="rounded-full border border-border bg-foreground px-4 py-2 text-[12px] font-medium text-background"
              >
                Cadastrar novo plano
              </button>
            ) : null}
          </div>
          <ul className="divide-y divide-border-subtle rounded-lg border border-border">
            {companies.map((company) => {
              const plan = plansByCompanyId.get(company.id);
              const isContract =
                company.name.trim().toLowerCase() ===
                proposalCompanyName.trim().toLowerCase();
              return (
                <li key={company.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {company.name}
                        {isContract ? (
                          <span className="ml-2 font-normal text-[11px] text-muted-foreground">
                            · contrato
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {company.organizationName}
                      </p>
                      <p className="mt-2 text-[12px] text-muted-foreground">
                        {plan
                          ? `${plan.operationProposalLabel} · atualizado em ${formatDate(plan.updatedAt)}`
                          : "Sem plano de marketing para esta empresa."}
                      </p>
                    </div>
                    {canEdit ? (
                      <button
                        type="button"
                        onClick={() => openEditor(company.id)}
                        className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-[12px] text-foreground hover:bg-surface-elevated"
                      >
                        {plan ? "Editar" : "Cadastrar"}
                      </button>
                    ) : null}
                  </div>
                  {!canEdit && plan ? (
                    <div className="mt-4 rounded-lg border border-border-subtle bg-background/40 p-4">
                      <PlanSummary plan={plan} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!canEdit && !clientListLayout ? (
        <div className="mt-4">
          {!saved ? (
            <p className="text-[13px] text-muted-foreground">
              Ainda não há plano publicado para esta empresa.
            </p>
          ) : (
            <PlanSummary plan={saved} />
          )}
        </div>
      ) : null}

      {showEditor ? (
        <form onSubmit={submit} className="mt-6 space-y-6">
          {clientListLayout ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[12px] font-medium text-foreground">
                {plansByCompanyId.has(companyId) ? "Editar plano" : "Novo plano"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setError(null);
                }}
                className="text-[12px] text-muted-foreground hover:text-foreground"
              >
                Voltar à lista
              </button>
            </div>
          ) : null}

          <div>
            <label className="text-[12px] font-medium">Empresa</label>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Contrato: {proposalCompanyName}
            </p>
            <select
              value={companyId}
              onChange={(e) => applyFieldsForCompany(e.target.value)}
              className="mt-2 w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
              required
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.organizationName} — {c.name}
                </option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="text-[12px] font-medium">Proposta da operação</legend>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {OPERATION_PROPOSAL_OPTIONS.map((option) => (
                <li key={option.id}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${
                      operationProposal === option.id
                        ? "border-foreground bg-surface-elevated"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="operationProposal"
                      checked={operationProposal === option.id}
                      onChange={() => setOperationProposal(option.id)}
                      required
                    />
                    <span className="text-[12px]">
                      <span className="block font-medium">{option.label}</span>
                      <span className="text-muted-foreground">{option.description}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="text-[12px] font-medium">Funil de aquisição</legend>
            {funnelGroups.map(([group, options]) => (
              <div key={group} className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {group}
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {options.map((option) => (
                    <li key={option.id}>
                      <label
                        className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                          funnelTouchpoints.includes(option.id)
                            ? "border-foreground bg-surface-elevated"
                            : "border-border"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={funnelTouchpoints.includes(option.id)}
                          onChange={() =>
                            toggle(funnelTouchpoints, option.id, setFunnelTouchpoints)
                          }
                        />
                        <span>
                          <span className="block font-medium">{option.label}</span>
                          <span className="text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </fieldset>

          <fieldset>
            <legend className="text-[12px] font-medium">
              Onde vamos anunciar
            </legend>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Marque cada plataforma que entra na operação (pode ser mais de uma).
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {PAID_PLATFORM_OPTIONS.map((option) => (
                <li key={option.id}>
                  <label
                    className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2.5 text-[12px] ${
                      mediaChannels.includes(option.id)
                        ? "border-foreground bg-surface-elevated"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={mediaChannels.includes(option.id)}
                      onChange={() =>
                        toggle(mediaChannels, option.id, setMediaChannels)
                      }
                    />
                    <span>
                      <span className="block font-medium">{option.label}</span>
                      <span className="text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset>
            <legend className="text-[12px] font-medium">Tipos de anúncio</legend>
            {adGroups.map(([group, options]) => (
              <div key={group} className="mt-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {group}
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {options.map((option) => (
                    <li key={option.id}>
                      <label
                        className={`flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-[12px] ${
                          adFormats.includes(option.id)
                            ? "border-foreground bg-surface-elevated"
                            : "border-border"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={adFormats.includes(option.id)}
                          onChange={() => toggle(adFormats, option.id, setAdFormats)}
                        />
                        <span>
                          <span className="block font-medium">{option.label}</span>
                          <span className="text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </fieldset>

          <div>
            <label className="text-[12px] font-medium" htmlFor="plan-notes">
              Observações
            </label>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Público, oferta, criativos, restrições ou canais extras (ex.: TikTok).
            </p>
            <textarea
              id="plan-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex.: priorizar Instagram Reels; testar presell antes da página de vendas…"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px]"
            />
          </div>

          {error ? <p className="text-[13px] text-red-400">{error}</p> : null}
          {message ? <p className="text-[13px] text-positive">{message}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-foreground px-5 py-2.5 text-[12px] font-medium text-background disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar plano de marketing"}
          </button>

          {saved && !clientListLayout ? (
            <div className="rounded-lg border border-border-subtle bg-background/40 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                Resumo salvo
              </p>
              <PlanSummary plan={saved} />
            </div>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
