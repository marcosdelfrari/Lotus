"use client";

import { PROPOSAL_FLOW_STEPS } from "@/lib/commercial-defaults";

export function ProposalStepNav({
  currentStep,
  onStepChange,
  maxStep = 6,
  interactive = true,
}: {
  currentStep: number;
  onStepChange?: (step: number) => void;
  maxStep?: number;
  interactive?: boolean;
}) {
  const steps = PROPOSAL_FLOW_STEPS.filter((step) => step.id <= maxStep);

  return (
    <nav className="space-y-2" aria-label="Etapas da proposta">
      {steps.map((step) => {
        const active = step.id === currentStep;
        const done = step.id < currentStep;
        const Tag = interactive && onStepChange ? "button" : "div";

        return (
          <Tag
            key={step.id}
            type={interactive && onStepChange ? "button" : undefined}
            onClick={
              interactive && onStepChange && step.id <= maxStep
                ? () => onStepChange(step.id)
                : undefined
            }
            className={`flex w-full gap-4 rounded-xl border px-4 py-4 text-left transition-all duration-300 ${
              active
                ? "border-foreground/15 bg-surface-elevated shadow-sm"
                : done
                  ? "border-border/60 bg-surface/80 hover:bg-surface-elevated/40"
                  : "border-border-subtle/30 bg-surface/30 opacity-60"
            } ${interactive && onStepChange ? "cursor-pointer" : ""}`}
          >
            <span
              className={`mt-0.5 font-mono text-[11px] font-light tabular-nums tracking-tighter ${
                active ? "text-foreground" : "text-muted"
              }`}
            >
              {String(step.id).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block text-[13px] font-medium leading-snug tracking-tight ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {active ? (
                <span className="mt-1.5 block text-[11px] leading-relaxed text-muted-foreground/80">
                  {step.hint}
                </span>
              ) : null}
            </span>
          </Tag>
        );
      })}
    </nav>
  );
}
