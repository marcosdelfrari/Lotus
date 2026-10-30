"use client";

import { useRouter } from "next/navigation";
import {
  formatWhatsapp,
  LOTUS_WHATSAPP_LABEL,
  LOTUS_WHATSAPP_URL,
} from "@/lib/whatsapp";

export function WhatsappNextStep({
  registeredWhatsapp,
  userName,
}: {
  registeredWhatsapp?: string;
  userName?: string;
}) {
  const router = useRouter();
  const formattedUserPhone = registeredWhatsapp
    ? formatWhatsapp(registeredWhatsapp)
    : null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/12 bg-[#141413] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-positive/40 to-transparent"
      />

      <div className="border-b border-white/8 bg-white/[0.02] px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-positive">
            Contato confirmado
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/25 bg-positive/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            Etapa 3/4
          </span>
        </div>
        <h2 className="mt-2 text-base font-medium tracking-tight text-white">
          Fale com a Lótus no WhatsApp
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Diagnóstico rápido e liberação da proposta neste painel.
        </p>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="rounded-xl border border-white/8 bg-white/[0.025] px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-muted">
                WhatsApp registrado
              </p>
              <p className="mt-0.5 text-xs font-medium text-white">
                {formattedUserPhone ?? "Registrado com sucesso"}
              </p>
              {userName && (
                <p className="text-[11px] text-muted-foreground">{userName}</p>
              )}
            </div>
            <span className="rounded-full border border-positive/30 bg-positive/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-positive">
              Ativo ✓
            </span>
          </div>
        </div>

        <a
          href={LOTUS_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-[13px] font-semibold text-background transition-all hover:opacity-95"
          onClick={() => {
            router.push("/obrigado");
          }}
        >
          <span>Chamar no WhatsApp</span>
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>

        <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-3 text-[10.5px] text-muted">
          <span>Linha direta Lótus</span>
          <span className="font-mono text-[10.5px] text-white/70">{LOTUS_WHATSAPP_LABEL}</span>
        </div>
      </div>
    </div>
  );
}
