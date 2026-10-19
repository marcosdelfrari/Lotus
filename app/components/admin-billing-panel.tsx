"use client";

import { useTransition } from "react";
import { adminConfirmBillingPaymentAction } from "@/app/(workspace)/admin/actions";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { BillingItemWithClient } from "@/lib/billing-store";
import { BillingItemStatus } from "@/lib/generated/prisma/browser";

export function AdminBillingPanel({
  pending,
  proposalItems,
  proposalCompanyName,
}: {
  pending: BillingItemWithClient[];
  proposalItems?: BillingItemWithClient[];
  proposalCompanyName?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const payableId = proposalItems?.find(
    (row) => row.status === BillingItemStatus.pending && row.dueDate,
  )?.id;

  function confirm(id: string) {
    startTransition(async () => {
      await adminConfirmBillingPaymentAction(id);
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-medium">Pagamentos pendentes</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Confirme quando o PIX cair. A primeira mensalidade fica com data pendente
          até a implantação; depois, cada vencimento é 1 mês após o anterior.
        </p>
        {pending.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum pagamento aguardando confirmação.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border-subtle rounded-xl border border-border bg-surface">
            {pending.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {row.companyName || "Cliente"}
                    <span className="ml-2 text-[11px] font-normal text-muted">
                      {row.label}
                    </span>
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {row.clientName || row.clientEmail}
                  </p>
                  <p className="mt-1 font-mono text-sm tabular-nums">
                    {formatCurrency(row.amount)}
                    {row.dueDate ? (
                      <span className="ml-2 text-[11px] font-sans text-muted">
                        · venc. {formatShortDate(row.dueDate)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => confirm(row.id)}
                  className="shrink-0 rounded-full bg-foreground px-4 py-2 text-[12px] font-medium text-background disabled:opacity-60"
                >
                  Confirmar pagamento
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {proposalItems && proposalItems.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium">
            Histórico — {proposalCompanyName ?? "proposta"}
          </h2>
          <ul className="mt-3 divide-y divide-border-subtle rounded-xl border border-border bg-surface">
            {proposalItems.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <div>
                  <p className="text-sm">{row.label}</p>
                  <p className="text-[11px] text-muted">
                    {row.dueDate
                      ? `Venc. ${formatShortDate(row.dueDate)}`
                      : "Data pendente"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm tabular-nums">
                    {formatCurrency(row.amount)}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wide ${
                      row.status === BillingItemStatus.paid
                        ? "text-positive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.status === BillingItemStatus.paid ? "Pago" : "Pendente"}
                  </span>
                  {row.id === payableId ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => confirm(row.id)}
                      className="rounded-full border border-border px-3 py-1 text-[11px] hover:bg-surface-elevated disabled:opacity-60"
                    >
                      Confirmar
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
