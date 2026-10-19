import { SectionShell } from "@/app/components/lotus/section-shell";
import { Reveal } from "@/app/components/lotus/motion";

const nodes = [
  { label: "Lotus", detail: "Solicitação e aceite" },
  { label: "PostgreSQL", detail: "users.plan_active" },
  { label: "Analytics", detail: "Dashboard Plano Pro" },
];

export function LotusFlowDiagram() {
  return (
    <SectionShell
      id="flow"
      title="Um cadastro, dois produtos"
      subtitle="Aceitar tráfego pago aqui ativa o Plano Pro no app Analytics automaticamente."
      className="pb-8 lg:pb-16"
    >
      <Reveal>
        <div className="flex flex-col items-stretch justify-center gap-3 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:gap-4 sm:p-8">
          {nodes.map((node, index) => (
            <div key={node.label} className="flex flex-1 items-center gap-3">
              <div className="flex flex-1 flex-col rounded-xl border border-border-subtle bg-background/60 px-4 py-5 text-center">
                <p className="text-sm font-medium">{node.label}</p>
                <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
                  {node.detail}
                </p>
              </div>
              {index < nodes.length - 1 ? (
                <span className="hidden text-muted sm:inline" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </Reveal>
    </SectionShell>
  );
}
