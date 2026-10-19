import Link from "next/link";
import { Reveal } from "@/app/components/lotus/motion";

const points = [
  "Estratégia de mídia",
  "Gestão de Google Ads",
  "Gestão de Meta Ads",
  "Criativos e copies",
  "Landing de captação",
  "Relatório de investimento x resultado",
];

export function LotusOperation() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Anúncio sem método não resiste ao mês seguinte.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            A Lótus reduz o custo de adquirir cliente, organiza a reputação da
            oferta no anúncio e acelera vendas com campanhas que você consegue
            auditar. O trabalho responde uma pergunta simples: por que essa
            pessoa deveria comprar de você — e quanto custa trazê-la até aqui.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <p className="text-lg font-medium">
              Sua operação de tráfego, pronta para usar.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Evite montar, treinar e gerir um time interno só para manter
              Google e Meta no ar. A gestão entra no seu negócio e entrega
              campanha, otimização e leitura de resultado desde o primeiro ciclo.
            </p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="rounded-lg border border-border-subtle bg-background/50 px-3 py-2 text-[13px]"
                >
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/login?next=/propostas"
              className="mt-8 inline-flex rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background"
            >
              Solicitar proposta
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
