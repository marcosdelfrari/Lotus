import { RevealGroup, RevealItem } from "@/app/components/lotus/motion";
import { SectionShell } from "@/app/components/lotus/section-shell";

const services = [
  {
    title: "Gestão de Google Ads",
    text: "Pesquisa, display e performance max com estrutura de campanha, palavras, negativas e orçamento controlado pelo que de fato converte.",
  },
  {
    title: "Gestão de Meta Ads",
    text: "Campanhas de alcance, consideração e conversão no Instagram e Facebook, com público, criativo e oferta testados em ciclo contínuo.",
  },
  {
    title: "Estratégia de mídia",
    text: "Definição de objetivo, funil, ticket e meta de CPA antes de ligar o anúncio — para cada real ter um papel claro na venda.",
  },
  {
    title: "Criativos que vendem",
    text: "Direção de anúncio, copies e variações de criativo orientadas a clique qualificado, não a vaidade de impressão.",
  },
  {
    title: "Landing e conversão",
    text: "Página de captação alinhada à campanha, para o tráfego não morrer no clique e o lead chegar pronto para o comercial.",
  },
  {
    title: "Leitura de resultado",
    text: "Investimento, leads e origem no mesmo painel. Você vê o que a mídia pagou e o que o negócio recebeu de volta.",
  },
];

export function LotusBenefits() {
  return (
    <SectionShell
      id="servicos"
      title="O que a gestão de tráfego entrega"
      subtitle="Uma operação de mídia paga pronta para gerar demanda — da estratégia ao anúncio no ar, com prestação de contas."
    >
      <RevealGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((item) => (
          <RevealItem
            key={item.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="text-base font-medium">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}
