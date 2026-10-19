"use client";

import { useRouter } from "next/navigation";
import { LOTUS_WHATSAPP_LABEL, LOTUS_WHATSAPP_URL } from "@/lib/whatsapp";

export function WhatsappNextStep() {
  const router = useRouter();

  return (
    <div className="max-w-md rounded-xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
        Próximo passo
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight">Fale com a Lótus no WhatsApp.</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Seu contato já está registrado. A conversa segue neste número.
      </p>
      <a
        href={LOTUS_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
        onClick={() => {
          router.push("/obrigado");
        }}
      >
        Chamar no WhatsApp
      </a>
      <p className="mt-3 text-[12px] text-muted">{LOTUS_WHATSAPP_LABEL}</p>
    </div>
  );
}
