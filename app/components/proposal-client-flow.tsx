"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { acceptProposalAction } from "@/app/(workspace)/propostas/actions";
import { ProposalAcceptedScreen } from "@/app/components/proposal-accepted-screen";
import { ProposalFlowStepBody } from "@/app/components/proposal-flow-sections";
import { collectAcceptanceDevice } from "@/lib/acceptance";
import { PROPOSAL_FLOW_STEPS } from "@/lib/commercial-defaults";
import type { TrafficProposalView } from "@/lib/proposal-types";

export function ProposalClientFlow({
  proposal,
  planAlreadyActive,
  previewMode = false,
  contractReviewOnly = false,
}: {
  proposal: TrafficProposalView;
  planAlreadyActive?: boolean;
  previewMode?: boolean;
  /** Abre direto no dossiê da proposta aceita (área do cliente). */
  contractReviewOnly?: boolean;
}) {
  const isAcceptedInitial = proposal.status === "accepted";
  const [step, setStep] = useState(isAcceptedInitial ? 6 : 1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [terms, setTerms] = useState(false);
  const [accepted, setAccepted] = useState(isAcceptedInitial);
  const [reviewingProposal, setReviewingProposal] = useState(contractReviewOnly);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const flowRef = useRef<HTMLDivElement>(null);

  const isAccepted = accepted || proposal.status === "accepted";
  const canAccept = proposal.status === "sent" && !previewMode && !isAccepted;
  const maxStep = canAccept || previewMode || isAccepted ? 6 : 5;
  const visibleSteps = PROPOSAL_FLOW_STEPS.filter((s) => s.id <= maxStep);

  const goToStep = useCallback(
    (nextStep: number) => {
      const clamped = Math.max(1, Math.min(maxStep, nextStep));
      if (clamped === step) return;
      setDirection(clamped >= step ? 1 : -1);
      setStep(clamped);
      requestAnimationFrame(() => {
        flowRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    },
    [maxStep, step],
  );

  useEffect(() => {
    if (isAccepted && !previewMode && !reviewingProposal) return;

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToStep(step + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToStep(step - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goToStep, isAccepted, previewMode, reviewingProposal, step]);

  if (isAccepted && !previewMode && !reviewingProposal) {
    return (
      <ProposalAcceptedScreen
        proposal={proposal}
        emailWarning={error}
        onReviewProposal={() => {
          setStep(1);
          setReviewingProposal(true);
        }}
      />
    );
  }

  const progressPct = (step / maxStep) * 100;

  return (
    <div ref={flowRef} className="scroll-mt-3 space-y-2.5 sm:space-y-5">
      {/* Top Deck Bar */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/7 bg-[#111111]/90 px-3 py-2 backdrop-blur-md sm:flex-wrap sm:gap-4 sm:rounded-2xl sm:px-5 sm:py-3">
        <div
          className={`items-center gap-3 ${
            isAccepted && !previewMode ? "flex shrink-0" : "hidden sm:flex"
          }`}
        >
          {isAccepted && !previewMode ? (
            contractReviewOnly ? (
              <Link
                href="/servicos"
                className="inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-positive transition-colors hover:bg-positive/20 sm:gap-1.5 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]"
              >
                ← <span className="sm:hidden">Voltar</span>
                <span className="hidden sm:inline">Serviços contratados</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setReviewingProposal(false)}
                className="inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-positive transition-colors hover:bg-positive/20 sm:gap-1.5 sm:px-3 sm:text-[10px] sm:tracking-[0.18em]"
              >
                ← <span className="sm:hidden">Voltar</span>
                <span className="hidden sm:inline">Voltar para confirmação</span>
              </button>
            )
          ) : (
            <span
              className={`h-2 w-2 rounded-full ${
                isAccepted ? "bg-positive" : "bg-foreground"
              }`}
            />
          )}
          <div className="hidden items-center gap-2 sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
              Proposta
            </span>
            <span className="text-white/20">/</span>
            <span className="max-w-50 truncate text-xs font-medium text-foreground sm:max-w-xs">
              {proposal.companyName}
            </span>
          </div>
        </div>

        {/* Horizontal Slide Selector */}
        <nav
          aria-label="Etapas da proposta"
          className="flex flex-1 items-center justify-between gap-1 overflow-x-auto py-0.5 sm:flex-initial sm:justify-start"
        >
          {visibleSteps.map((s) => {
            const active = s.id === step;
            const past = s.id < step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                className={`group flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] transition-all sm:px-3 sm:py-1.5 sm:text-[11px] ${
                  active
                    ? "bg-foreground font-medium text-background shadow-sm"
                    : past
                      ? "text-foreground/75 hover:bg-white/5 hover:text-foreground"
                      : "text-muted hover:bg-white/4 hover:text-muted-foreground"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    active ? "text-background/70" : "text-muted"
                  }`}
                >
                  {String(s.id).padStart(2, "0")}
                </span>
                <span className="hidden md:inline">{s.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[11px] tabular-nums text-muted sm:flex">
          <span className="text-foreground">{String(step).padStart(2, "0")}</span>
          <span className="text-white/20">/</span>
          <span>{String(maxStep).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Main Widescreen Slide Stage */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/9 bg-linear-to-b from-[#161616] via-[#101010] to-[#0b0b0b] shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:min-h-147.5 sm:rounded-[28px]">
        {/* Progress hairline at top of slide */}
        <div className="h-0.5 w-full bg-white/4">
          <div
            className="h-full bg-linear-to-r from-white/40 via-white/80 to-white transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Subtle ambient lighting */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/3.5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/2 blur-3xl"
        />

        {/* Slide Body */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-4 sm:p-10 lg:p-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -18 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-1 flex-col justify-between gap-6"
            >
              <ProposalFlowStepBody
                step={step}
                proposal={proposal}
                onJumpToStep={goToStep}
              />

              {/* Digital Acceptance Module inside Slide 06 */}
              {step === 6 && (canAccept || previewMode) ? (
                <div className="rounded-2xl border border-white/15 bg-white/3 p-5 backdrop-blur-sm sm:p-6">
                  {planAlreadyActive ? (
                    <p className="mb-4 rounded-xl border border-white/10 bg-white/2 px-3.5 py-2.5 text-xs font-light text-muted-foreground">
                      Sua conta já está ativa no ecossistema Lótus; este aceite formaliza a
                      contratação da gestão de tráfego desta proposta.
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <label className="flex cursor-pointer items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 accent-foreground"
                      />
                      <span className="max-w-2xl text-xs font-light leading-relaxed text-muted-foreground">
                        Li e concordo com o escopo, cronograma, investimentos e termos desta
                        proposta. Autorizo o início da{" "}
                        <strong className="font-medium text-foreground">
                          gestão de tráfego pago
                        </strong>{" "}
                        nos canais e valores descritos acima.
                      </span>
                    </label>

                    <button
                      type="button"
                      disabled={!terms || pending}
                      onClick={() => {
                        if (previewMode) return;
                        setError(null);
                        startTransition(async () => {
                          const device = await collectAcceptanceDevice();
                          const result = await acceptProposalAction(proposal.id, device);
                          if ("error" in result) {
                            setError(result.error ?? "Não foi possível aceitar.");
                            return;
                          }
                          if (!result.emailSent && result.emailError) {
                            setError(`Proposta aceita. A cópia em PDF não foi enviada: ${result.emailError}`);
                          }
                          setAccepted(true);
                        });
                      }}
                      className="shrink-0 rounded-full bg-foreground px-7 py-3 text-xs font-medium tracking-wide text-background transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-30"
                    >
                      {pending
                        ? "Registrando aceite..."
                        : "Confirmar contratação →"}
                    </button>
                  </div>

                  {error ? <p className="mt-3 text-xs text-negative">{error}</p> : null}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Deck Bottom Dock */}
        <footer className="relative z-10 flex items-center justify-between gap-3 border-t border-white/6 bg-black/25 px-4 py-3 sm:flex-wrap sm:gap-4 sm:px-10 sm:py-4">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
              LÓTUS
            </span>
            <span className="hidden text-[11px] font-light text-muted/60 lg:inline">
              · Use as setas ← → do teclado para navegar
            </span>
          </div>

          {/* Slide Dots */}
          <div className="flex items-center gap-1.5" aria-hidden>
            {visibleSteps.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(s.id)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s.id === step
                    ? "w-6 bg-foreground"
                    : s.id < step
                      ? "w-2 bg-white/35"
                      : "w-1.5 bg-white/15"
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={step <= 1}
              onClick={() => goToStep(step - 1)}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/2 px-3.5 py-2 text-[11px] font-medium tracking-wide text-foreground transition-all hover:border-white/25 hover:bg-white/6 disabled:opacity-20 sm:px-4"
            >
              ← Anterior
            </button>
            {step < maxStep ? (
              <button
                type="button"
                onClick={() => goToStep(step + 1)}
                className="whitespace-nowrap rounded-full bg-foreground px-4 py-2 text-[11px] font-medium tracking-wide text-background transition-all hover:opacity-90 active:scale-[0.98] sm:px-5"
              >
                Continuar →
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
