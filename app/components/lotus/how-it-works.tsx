import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const steps = [
  {
    step: "01",
    title: "Faça Login",
    text: "Entrada rápida, sem formulário de cadastro.",
  },
  {
    step: "02",
    title: "Solicite a gestão",
    text: "No ambiente logado, você dá o próximo passo e a Lótus entende objetivo, segmento e momento do negócio.",
  },
  {
    step: "03",
    title: "Receba a proposta",
    text: "Escopo, serviços, fee de gestão e investimento sugerido em mídia — tudo explícito antes de começar.",
  },
  {
    step: "04",
    title: "Coloque no ar",
    text: "Aceite digital na proposta, painel de resultados liberado e kickoff de contas, criativos e otimização.",
  },
];

export function LotusHowItWorks() {
  return (
    <SectionShell
      id="como-funciona"
      title="Contratação clara, do login à campanha."
      subtitle="Poucas etapas, proposta transparente e operação de tráfego com prestação de contas no painel."
    >
      <RevealGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <RevealItem
            key={item.step}
            className="group relative rounded-2xl border border-border bg-surface p-8 transition-colors hover:bg-surface-elevated"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-muted/30 transition-colors group-hover:text-accent/20">
                {item.step}
              </span>
              <div className="h-2 w-2 rounded-full bg-border-subtle group-hover:bg-accent/40" />
            </div>
            <h3 className="mt-6 min-h-[3.5rem] text-balance text-xl font-semibold leading-snug tracking-tight">
              {item.title}
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground group-hover:text-foreground/80">
              {item.text}
            </p>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-14 text-center">
        <Link
          href="/login?next=/propostas"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Começar agora
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </Reveal>
    </SectionShell>
  );
}
