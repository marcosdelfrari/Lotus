"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, motionEase } from "@/app/components/lotus/motion";

const links = [
  { href: "#servicos", label: "O que fazemos" },
  { href: "#analytics", label: "Analytics" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

function HeroBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused && video.currentTime > 0) {
      markVideoReady();
    }
  }, [markVideoReady]);

  return (
    <div className="absolute inset-0 bg-black" aria-hidden>
      <Image
        src="/hero-poster.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <motion.video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        initial={false}
        animate={{ opacity: videoReady ? 1 : 0 }}
        transition={{ duration: 0.75, ease: motionEase }}
        onPlaying={markVideoReady}
      >
        <source src="/hero.webm" type="video/webm" />
        <source src="/hero.mp4" type="video/mp4" />
      </motion.video>
    </div>
  );
}

export function LotusHero() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative isolate h-dvh overflow-hidden bg-black text-white">
      <HeroBackdrop />

      <motion.div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: motionEase, delay: 0.05 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: "url(/pattern.webp)",
            backgroundRepeat: "repeat",
            backgroundSize: "180px 180px",
          }}
        />
      </motion.div>

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

      <AnimatePresence>
        {open ? (
          <motion.nav
            className="absolute inset-x-0 top-20 z-20 px-6 sm:px-10 lg:px-14"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: motionEase }}
          >
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
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-10 pt-24 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12,
              delayChildren: 0.15,
            },
          },
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
