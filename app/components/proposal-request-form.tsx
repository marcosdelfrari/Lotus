"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { submitInterest } from "@/app/(workspace)/propostas/actions";

export function ProposalRequestForm() {
  const router = useRouter();
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
    <div className="max-w-xl">
      <form
        action={action}
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      >
        <div className="border-b border-border bg-background/30 px-6 py-5 sm:px-8">
          <h2 className="text-base font-semibold tracking-tight">Qual o seu melhor contato?</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Seu nome e e-mail já estão seguros conosco. Falta apenas o número para iniciarmos a
            estratégia.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
              WhatsApp com DDD
            </span>
            <input
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              placeholder="(00) 00000-0000"
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base outline-none transition focus:border-foreground/30 focus:ring-4 focus:ring-foreground/5"
            />
          </label>

          {state?.error ? (
            <div className="mt-4 rounded-lg bg-negative/5 px-4 py-3 text-[13px] text-negative">
              {state.error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-4 text-sm font-bold text-background transition-all hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Confirmar e prosseguir"}
            {!pending && (
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 px-2 text-[11px] leading-relaxed text-muted">
        Ao prosseguir, você concorda que entraremos em contato para tratar da sua operação de
        tráfego. Sem spam, apenas negócio.
      </p>
    </div>
  );
}
