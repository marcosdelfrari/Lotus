import Link from "next/link";
import { Reveal } from "@/app/components/lotus/motion";

const points = [
  "Estratégia de mídia",
  "Gestão de Google Ads",
  "Gestão de Meta Ads",
  "Criativos e copies",
  "Landing de captação",
  "Leitura de ROI/ROAS",
];

export function LotusOperation() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Anúncio sem método não resiste ao mês seguinte.
          </h2>
          <p className="mt-6 text-base leading-7 text-muted-foreground sm:text-lg">
            A Lótus reduz o custo de adquirir cliente e acelera vendas com
            campanhas que você consegue auditar. O trabalho responde uma
            pergunta simples: por que essa pessoa deveria comprar de você — e
            quanto custa trazê-la até aqui.
          </p>
        </Reveal>
        
        <Reveal delay={0.08}>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 sm:p-10">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-accent/5 blur-[100px]" />
            
            <p className="relative z-10 text-xl font-semibold tracking-tight">
              Sua operação de tráfego, pronta para usar.
            </p>
            <p className="relative z-10 mt-4 text-sm leading-relaxed text-muted-foreground">
              Evite montar, treinar e gerir um time interno. A gestão entra no
              seu negócio e entrega campanha, otimização e leitura de resultado
              desde o primeiro ciclo.
            </p>
            
            <ul className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 rounded-xl border border-border-subtle bg-background/50 px-4 py-3 text-[13px] font-medium transition-colors hover:border-accent/20"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-accent/40" />
                  {point}
                </li>
              ))}
            </ul>
            
            <Link
              href="/login?next=/propostas"
              className="relative z-10 mt-10 inline-flex w-full items-center justify-center rounded-xl bg-foreground px-6 py-4 text-sm font-bold text-background transition-transform hover:scale-[0.99] active:scale-[0.97]"
            >
              Começar agora
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
