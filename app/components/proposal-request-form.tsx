"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { submitInterest } from "@/app/(workspace)/propostas/actions";

function maskPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ProposalRequestForm({
  userName,
  userEmail,
}: {
  userName?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; ok?: boolean } | null, formData: FormData) => {
      return submitInterest(formData);
    },
    null,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="w-full">
      <form
        action={action}
        className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#141413] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/25 to-transparent"
        />

        <div className="border-b border-white/8 bg-white/[0.02] px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted">
              Canal direto
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/25 bg-positive/10 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-positive">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" />
              Etapa 2/4
            </span>
          </div>
          <h2 className="mt-2 text-base font-medium tracking-tight text-white">
            Qual o seu melhor WhatsApp?
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Seu nome e e-mail já estão salvos. Falta apenas o número para alinharmos a proposta.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          {(userName || userEmail) && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3.5 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">
                  {userName || userEmail}
                </p>
                {userName && userEmail && (
                  <p className="truncate text-[11px] text-muted-foreground">{userEmail}</p>
                )}
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white/70">
                Conta ativa ✓
              </span>
            </div>
          )}

          <label className="block">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              WhatsApp com DDD
            </span>
            <div className="relative mt-1.5">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="font-mono text-xs text-muted">+55</span>
                <span className="mx-2.5 h-3.5 w-px bg-white/10" />
              </div>
              <input
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(maskPhoneInput(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full rounded-xl border border-white/12 bg-black/50 py-3 pr-4 pl-15 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-white/35 focus:bg-black/70 focus:ring-4 focus:ring-white/5"
              />
            </div>
          </label>

          {state?.error ? (
            <div className="rounded-xl border border-negative/25 bg-negative/10 px-3.5 py-2.5 text-xs text-negative">
              {state.error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-[13px] font-semibold text-background transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Confirmar e prosseguir"}
            {!pending && (
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            )}
          </button>

          <div className="flex items-center justify-between gap-2 border-t border-white/8 pt-3 text-[10.5px] text-muted">
            <span>Sem spam, apenas negócio.</span>
            <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40">
              Atendimento direto
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
