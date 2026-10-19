import { RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const services = [
  {
    title: "Gestão de Google Ads",
    text: "Pesquisa, display e performance max com estrutura de campanha, palavras, negativas e orçamento controlado pelo que de fato converte.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="12" r="10" />
        <path d="m16 10-4 4-4-4" />
      </svg>
    ),
  },
  {
    title: "Gestão de Meta Ads",
    text: "Campanhas de alcance, consideração e conversão no Instagram e Facebook, com público, criativo e oferta testados em ciclo contínuo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    title: "Estratégia de mídia",
    text: "Definição de objetivo, funil, ticket e meta de CPA antes de ligar o anúncio — para cada real ter um papel claro na venda.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m21 16-4 4-4-4" />
        <path d="M17 20V4" />
        <path d="m3 8 4-4 4 4" />
        <path d="M7 4v16" />
      </svg>
    ),
  },
  {
    title: "Criativos que vendem",
    text: "Direção de anúncio, copies e variações de criativo orientadas a clique qualificado, não a vaidade de impressão.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    title: "Landing e conversão",
    text: "Página de captação alinhada à campanha, para o tráfego não morrer no clique e o lead chegar pronto para o comercial.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <line x1="3" x2="21" y1="9" y2="9" />
        <line x1="9" x2="9" y1="21" y2="9" />
      </svg>
    ),
  },
  {
    title: "Leitura de resultado",
    text: "Investimento, leads e origem no Lótus Analytics — incluso na gestão. Veja o que a mídia pagou e o que o negócio recebeu de volta.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
];

export function LotusBenefits() {
  return (
    <SectionShell
      id="servicos"
      title="O que a gestão de tráfego entrega"
      subtitle="Uma operação de mídia paga pronta para gerar demanda — da estratégia ao anúncio no ar, com prestação de contas."
    >
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((item) => (
          <RevealItem
            key={item.title}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-8 transition-all hover:border-accent/20 hover:bg-surface-elevated"
          >
            <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-accent/5 blur-3xl transition-colors group-hover:bg-accent/10" />
            
            <div className="relative z-10">
              <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-background text-muted-foreground transition-colors group-hover:border-accent/30 group-hover:text-accent">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground group-hover:text-foreground/80">
                {item.text}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}
