import Link from "next/link";
import { Reveal } from "@/app/components/lotus/motion";

export function LotusFinalCta() {
  return (
    <section id="contato" className="px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="rounded-2xl border border-border bg-surface px-6 py-14 text-center sm:px-12 sm:py-16">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Próximo passo</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Preencha os dados da sua empresa.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            Trabalhamos com um número limitado de novas contas de anúncio por
            ciclo. Vamos avaliar o encaixe entre o seu negócio e a gestão de
            tráfego pago da Lótus.
          </p>
          <Link
            href="/login?next=/propostas"
            className="mt-8 inline-flex rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Solicitar proposta
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
