import Image from "next/image";
import { redirect } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { ProposalAcceptPanel } from "@/app/components/proposal-accept-panel";
import { ProposalRequestForm } from "@/app/components/proposal-request-form";
import { WhatsappNextStep } from "@/app/components/whatsapp-next-step";
import { logout } from "@/app/login/actions";
import { getSession } from "@/lib/auth";
import { getInterestForUser } from "@/lib/interests-store";
import { hasActivePlan } from "@/lib/plan";
import {
  ensureProPlanForAcceptedProposal,
  getLatestProposalForUser,
} from "@/lib/proposals-store";

export const instant = false;

export default async function PropostasPage() {
  const session = await getSession();
  if (!session) return null;

  if (session.role === "admin") {
    redirect("/admin");
  }

  const [interest, proposal] = await Promise.all([
    getInterestForUser(session.userId),
    getLatestProposalForUser(session.userId, session.email),
  ]);

  if (proposal && (proposal.status === "sent" || proposal.status === "accepted")) {
    let planAlreadyActive = hasActivePlan(session);
    if (proposal.status === "accepted" && !planAlreadyActive) {
      await ensureProPlanForAcceptedProposal({
        proposal,
        sessionUserId: session.userId,
        sessionEmail: session.email,
        planAlreadyActive,
      });
      const refreshed = await getSession();
      if (refreshed) planAlreadyActive = hasActivePlan(refreshed);
    }
    if (proposal.status === "accepted" && planAlreadyActive) {
      redirect("/servicos");
    }
    return (
      <ProposalAcceptPanel
        proposal={proposal}
        planAlreadyActive={planAlreadyActive}
      />
    );
  }

  const hasInterest = Boolean(interest);

  const journeySteps = [
    {
      step: "01",
      title: "Conta conectada",
      description: "Acesso verificado.",
      state: "done" as const,
    },
    {
      step: "02",
      title: "WhatsApp",
      description: "Canal para envio do diagnóstico.",
      state: hasInterest ? ("done" as const) : ("current" as const),
    },
    {
      step: "03",
      title: "Diagnóstico",
      description: "Alinhamento de metas e mídia.",
      state: hasInterest ? ("current" as const) : ("upcoming" as const),
    },
    {
      step: "04",
      title: "Proposta no painel",
      description: "Escopo e aceite digital.",
      state: "upcoming" as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#111111]/90 px-4 py-2.5 backdrop-blur-md sm:px-5">
        <div className="flex items-center gap-3">
          <BrandMark compact href="/" />
          <span className="text-white/15">/</span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-positive">
              {hasInterest ? "Diagnóstico" : "Onboarding"}
            </span>
            <span className="hidden text-white/20 sm:inline">·</span>
            <span className="hidden max-w-xs truncate text-xs font-medium text-foreground sm:inline">
              {session.name || session.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground md:inline">
            {session.email}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="cursor-pointer rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground"
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      {/* Main Stage */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-linear-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-5 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-7 lg:p-9">
        {/* Ambient Glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-positive/6 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-white/4 blur-3xl"
        />

        <div className="relative z-10 grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-10">
          {/* Action card first on mobile — CTA acima da copy longa */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            {interest ? (
              <WhatsappNextStep
                registeredWhatsapp={interest.whatsapp}
                userName={session.name}
              />
            ) : (
              <ProposalRequestForm
                userName={session.name}
                userEmail={session.email}
              />
            )}
          </div>

          {/* Editorial + stepper */}
          <div className="order-2 space-y-4 lg:order-1 lg:col-span-7 lg:space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-0.5">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground">
                  {hasInterest ? "Etapa 03 · Alinhamento" : "Etapa 02 · Contato"}
                </span>
              </div>

              <h1 className="max-w-xl text-[1.35rem] font-extralight leading-[1.15] tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[36px]">
                {hasInterest ? (
                  <>
                    Contato salvo.{" "}
                    <span className="font-normal text-white">
                      Vamos montar seu diagnóstico.
                    </span>
                  </>
                ) : (
                  <>
                    Um último detalhe para{" "}
                    <span className="font-normal text-white">
                      montarmos sua proposta.
                    </span>
                  </>
                )}
              </h1>

              {/* Copy curta e neutra de layout (sem "ao lado") — ocultar no mobile se já há CTA acima */}
              <p className="hidden max-w-lg text-[13.5px] font-light leading-relaxed text-muted-foreground sm:block">
                {hasInterest
                  ? "Chame no WhatsApp para concluir o diagnóstico e liberar a proposta neste painel."
                  : "Informe seu WhatsApp para enviarmos o diagnóstico e avisarmos quando a proposta estiver pronta."}
              </p>
            </div>

            {/* 4-Step Progress Roadmap */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {journeySteps.map((item) => {
                const isDone = item.state === "done";
                const isCurrent = item.state === "current";
                return (
                  <div
                    key={item.step}
                    className={`rounded-xl border px-3 py-2.5 transition-colors sm:px-3.5 sm:py-3 ${
                      isCurrent
                        ? "border-white/20 bg-white/[0.045]"
                        : isDone
                          ? "border-positive/25 bg-positive/[0.04]"
                          : "border-white/8 bg-white/[0.015] opacity-65"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted sm:text-[9.5px] sm:tracking-[0.18em]">
                        {item.step}
                      </span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-positive/15 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-positive sm:px-2 sm:text-[8.5px]">
                          ✓ Feito
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white sm:px-2 sm:text-[8.5px]">
                          • Agora
                        </span>
                      ) : (
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-muted sm:text-[8.5px]">
                          Breve
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] font-medium text-white sm:text-xs">
                      {item.title}
                    </p>
                    <p className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Ecosystem Strip — desktop only */}
            <div className="hidden flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4 lg:flex">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70">
                  <Image
                    src="/google-ads-icon.webp"
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5"
                  />
                  Google Ads
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70">
                  <Image
                    src="/META.webp"
                    alt=""
                    width={18}
                    height={12}
                    className="h-2.5 w-auto"
                  />
                  Meta Ads
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                  Analytics 24/7
                </span>
              </div>

              <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted">
                Escopo transparente
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
