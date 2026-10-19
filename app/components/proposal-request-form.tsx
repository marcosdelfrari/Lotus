"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { submitProposalRequest } from "@/app/(workspace)/propostas/actions";

export function ProposalRequestForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; ok?: boolean } | null, formData: FormData) => {
      return submitProposalRequest(formData);
    },
    null,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-medium">Solicitar proposta de tráfego pago</h2>
      <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
        Conte sobre seu negócio. Montamos escopo, valores, prazo e investimento sugerido em
        anúncios; você recebe tudo aqui para aceitar online.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[12px] text-muted-foreground">Empresa</span>
          <input
            name="companyName"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
        <label className="block">
          <span className="text-[12px] text-muted-foreground">Segmento</span>
          <input
            name="segment"
            placeholder="Ex.: clínica, e-commerce"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
        <label className="block">
          <span className="text-[12px] text-muted-foreground">Orçamento mensal em mídia (R$)</span>
          <input
            name="monthlyMediaBudget"
            type="number"
            min={0}
            step={100}
            placeholder="4500"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[12px] text-muted-foreground">Objetivos e contexto</span>
          <textarea
            name="goals"
            rows={4}
            required
            placeholder="O que você quer gerar com os anúncios? Região, ticket, sazonalidade..."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-[12px] text-muted-foreground">WhatsApp / telefone</span>
          <input
            name="contactPhone"
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
      </div>

      {state?.error ? (
        <p className="mt-4 text-[13px] text-negative">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}
