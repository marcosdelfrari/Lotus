"use client";

import { formatCurrency } from "@/lib/format";

const preview = {
  company: "Sua empresa",
  title: "Gestão de tráfego pago",
  services: [
    { name: "Gestão Google + Meta", value: 3200 },
    { name: "Landing de captação", value: 1800 },
  ],
  adBudget: 4500,
};

export function HeroPreviewProposal() {
  const total = preview.services.reduce((s, line) => s + line.value, 0);

  return (
    <div className="bg-background p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Sua proposta</p>
          <p className="mt-1 text-sm font-medium">{preview.company}</p>
          <p className="text-[12px] text-muted-foreground">{preview.title}</p>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
          Aguardando aceite
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {preview.services.map((service) => (
          <li
            key={service.name}
            className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface/80 px-3 py-2.5"
          >
            <p className="text-[13px] font-medium">{service.name}</p>
            <p className="font-mono text-[12px] tabular-nums">{formatCurrency(service.value)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Mídia sugerida</p>
          <p className="mt-1 font-mono text-sm tabular-nums">
            {formatCurrency(preview.adBudget)}/mês
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Serviços</p>
          <p className="mt-1 font-mono text-sm tabular-nums">{formatCurrency(total)}</p>
        </div>
      </div>

      <p className="mt-4 rounded-md bg-foreground py-2 text-center text-[12px] font-medium text-background">
        Aceitar e ativar Plano Pro
      </p>
    </div>
  );
}
