import Link from "next/link";
import { Reveal } from "@/app/components/lotus/motion";

export function LotusManifesto() {
  return (
    <section className="border-y border-border px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-end">
        <Reveal>
          <p className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Não existe volume
            <br />
            sem performance.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg">
            Muitas empresas gastam em anúncio e não sabem o que cada real está
            gerando. A Lótus assume a gestão de tráfego pago com estratégia,
            criativos alinhados à oferta e leitura contínua de custo por lead e
            por venda — para o investimento deixar de ser aposta e virar operação.
          </p>
          <Link
            href="/login?next=/propostas"
            className="mt-8 inline-flex text-sm font-medium underline-offset-4 hover:underline"
          >
            Entrar em contato
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
