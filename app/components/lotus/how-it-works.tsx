import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const steps = [
  {
    step: "01",
    title: "Você conta o negócio",
    text: "Empresa, oferta, região e quanto faz sentido investir em mídia. Avaliamos se a gestão encaixa no momento da sua venda.",
  },
  {
    step: "02",
    title: "Recebe a proposta",
    text: "Escopo, fee de gestão, prazo, condições e investimento sugerido em anúncios — escrito para decidir, não para adivinhar.",
  },
  {
    step: "03",
    title: "Aceita online",
    text: "Um clique formaliza a contratação. O Plano Pro do painel Lótus Analytics é liberado no mesmo cadastro.",
  },
  {
    step: "04",
    title: "Campanhas no ar",
    text: "Kickoff, acessos às contas de anúncio e otimização contínua com relatório do que o tráfego está gerando.",
  },
];

export function LotusHowItWorks() {
  return (
    <SectionShell
      id="como-funciona"
      title="Do primeiro contato à campanha no ar."
      subtitle="Poucas etapas. Você solicita, revisa a proposta e começa a gestão sem burocracia."
    >
      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((item) => (
          <RevealItem
            key={item.step}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <span className="font-mono text-xs text-muted">{item.step}</span>
            <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="mt-10 text-center">
        <Link
          href="/login?next=/propostas"
          className="inline-flex rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Solicitar proposta
        </Link>
      </Reveal>
    </SectionShell>
  );
}
