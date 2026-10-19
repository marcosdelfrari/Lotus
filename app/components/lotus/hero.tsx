"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/app/components/lotus/motion";

export function LotusHero() {
  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-28">
      <motion.div
        className="mx-auto max-w-4xl text-center"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
        }}
      >
        <motion.p
          className="text-sm uppercase tracking-[0.22em] text-muted-foreground"
          variants={fadeUp}
        >
          Gestão de tráfego pago
        </motion.p>
        <motion.h1
          className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]"
          variants={fadeUp}
        >
          Transformando investimento em anúncio em demanda previsível.
        </motion.h1>
        <motion.p
          className="mx-auto mt-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          variants={fadeUp}
        >
          Gestão de Google Ads e Meta Ads para empresas que querem vender mais com
          clareza: menos desperdício, campanha com método e resultado que você
          consegue acompanhar.
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          variants={fadeUp}
        >
          <Link
            href="/login?next=/propostas"
            className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Solicitar proposta
          </Link>
          <a
            href="#servicos"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            O que fazemos
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
