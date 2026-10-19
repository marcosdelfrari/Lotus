"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/app/components/lotus/motion";

const links = [
  { href: "#servicos", label: "O que fazemos" },
  { href: "#analytics", label: "Analytics" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

export function LotusHero() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative isolate h-dvh overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black via-black/50 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: "url(/pattern.webp)",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
        }}
        aria-hidden
      />

      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
        <Link href="/" className="inline-flex" aria-label="Lótus">
          <Image
            src="/lotuslogo.webp"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full"
          />
        </Link>
        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={`h-px w-6 bg-white transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-px w-6 bg-white transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </header>

      {open ? (
        <nav className="absolute inset-x-0 top-20 z-20 px-6 sm:px-10 lg:px-14">
          <ul className="w-fit space-y-3 rounded-md bg-black/55 px-5 py-4 backdrop-blur-sm">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm tracking-wide text-white/90 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-10 pt-24 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
        }}
      >
        <motion.h1 className="max-w-md text-[1.7rem] leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.35rem]" variants={fadeUp}>
          <span className="block font-light">Transformando anúncios</span>
          <span className="mt-1 block font-semibold">em demanda previsível</span>
        </motion.h1>
        <motion.p
          className="mt-4 max-w-sm text-[13px] leading-6 text-white/85 sm:text-sm"
          variants={fadeUp}
        >
          Gestão de Google Ads e Meta Ads para empresas que buscam clareza e
          resultado concreto em vendas.
        </motion.p>
        <motion.div className="mt-6 flex items-center gap-6" variants={fadeUp}>
          <span className="inline-flex items-center gap-2 text-[11px] text-white/90">
            <Image
              src="/google-ads-icon.webp"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] mix-blend-lighten"
            />
            Google Ads
          </span>
          <span className="inline-flex items-center gap-2 text-[11px] text-white/90">
            <Image
              src="/META.webp"
              alt=""
              width={22}
              height={14}
              className="h-3.5 w-auto mix-blend-lighten"
            />
            Meta Ads
          </span>
        </motion.div>
        <motion.div className="mt-6" variants={fadeUp}>
          <Link
            href="/login?next=/propostas"
            className="inline-flex border border-white/35 bg-white/10 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white transition hover:bg-white/20"
          >
            Começar agora
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
