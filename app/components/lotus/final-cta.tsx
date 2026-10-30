import Link from "next/link";
import { LotusContactAgentForm } from "@/app/components/lotus/contact-agent-form";
import { Reveal } from "@/app/components/lotus/motion";

export function LotusFinalCta() {
  return (
    <section id="contato" className="px-4 py-8 sm:px-6 lg:px-8 lg:pt-4 lg:pb-20">
      <Reveal className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#101010]">
        <div className="grid lg:grid-cols-12 lg:min-h-[22rem]">
          <div className="relative flex flex-col justify-between px-7 py-12 sm:px-12 sm:py-14 lg:col-span-7 lg:py-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">
              Próximo passo
            </p>
            <h2 className="mt-10 max-w-[11ch] text-[2.5rem] font-semibold leading-[0.96] tracking-[-0.035em] sm:text-6xl lg:mt-16">
              Preencha os dados da sua empresa.
            </h2>
          </div>
          <div className="flex flex-col justify-end border-t border-white/10 bg-white/[0.02] px-7 py-10 sm:px-12 lg:col-span-5 lg:border-t-0 lg:border-l lg:px-12 lg:py-16">
            <p className="max-w-sm text-sm leading-7 text-white/60 sm:text-[15px]">
              Trabalhamos com um número limitado de novas contas por ciclo.
              Vamos avaliar o encaixe entre o seu negócio e nossa gestão.
            </p>
            <LotusContactAgentForm />
            <Link
              href="/login?next=/propostas"
              className="group mt-4 inline-flex w-fit items-center gap-3 text-sm font-medium text-white/70 transition hover:text-white"
            >
              Já tenho conta — entrar
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
