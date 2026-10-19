"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  adminCreateProposalAction,
  type AdminFormState,
} from "@/app/(workspace)/admin/actions";

type Props = {
  userId: string;
  defaultCompanyName?: string;
  defaultContactPhone?: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/30";

export function AdminCreateProposalForm({
  userId,
  defaultCompanyName = "",
  defaultContactPhone = "",
}: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState<AdminFormState, FormData>(
    adminCreateProposalAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <input type="hidden" name="userId" value={userId} />
      <div>
        <h3 className="text-sm font-medium">Nova proposta</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Envia escopo, valores e condições padrão da Lótus para o cliente aceitar em
          /propostas.
        </p>
      </div>

      <label className="block text-[12px] font-medium text-muted-foreground">
        Empresa
        <input
          name="companyName"
          required
          defaultValue={defaultCompanyName}
          className={fieldClass}
          placeholder="Razão social ou nome fantasia"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[12px] font-medium text-muted-foreground">
          Segmento
          <input name="segment" className={fieldClass} placeholder="Ex.: clínica, e-commerce" />
        </label>
        <label className="block text-[12px] font-medium text-muted-foreground">
          Orçamento mensal em mídia (R$)
          <input
            name="monthlyMediaBudget"
            type="number"
            min={0}
            step={100}
            className={fieldClass}
            placeholder="4500"
          />
        </label>
      </div>

      <label className="block text-[12px] font-medium text-muted-foreground">
        Objetivos
        <textarea
          name="goals"
          rows={3}
          className={fieldClass}
          placeholder="Metas de leads, vendas, região..."
        />
      </label>

      <label className="block text-[12px] font-medium text-muted-foreground">
        Contato (WhatsApp)
        <input
          name="contactPhone"
          type="tel"
          defaultValue={defaultContactPhone}
          className={fieldClass}
          placeholder="(00) 00000-0000"
        />
      </label>

      {state?.error ? (
        <p className="text-[13px] text-negative">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-foreground py-2.5 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Criar e enviar proposta"}
      </button>
    </form>
  );
}
