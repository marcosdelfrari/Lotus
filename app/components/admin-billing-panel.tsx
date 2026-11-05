"use client";

import { useState, useTransition } from "react";
import {
  adminConfirmBillingPaymentAction,
  adminRevertBillingPaymentAction,
  adminUpdateBillingDueDateAction,
} from "@/app/(workspace)/admin/actions";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { BillingItemWithClient } from "@/lib/billing-store";
import { BillingItemStatus } from "@/lib/generated/prisma/browser";

function DueDateControls({
  row,
  editingId,
  draftDate,
  dateError,
  isPending,
  onStartEdit,
  onCancel,
  onDraftChange,
  onSave,
}: {
  row: { id: string; dueDate: string | null; status: BillingItemStatus };
  editingId: string | null;
  draftDate: string;
  dateError: string | null;
  isPending: boolean;
  onStartEdit: (row: { id: string; dueDate: string | null }) => void;
  onCancel: () => void;
  onDraftChange: (value: string) => void;
  onSave: (id: string) => void;
}) {
  if (row.status === BillingItemStatus.paid) {
    return (
      <p className="text-[11px] text-muted">
        {row.dueDate ? `Venc. ${formatShortDate(row.dueDate)}` : "Sem vencimento"}
      </p>
    );
  }

  if (editingId === row.id) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={draftDate}
          onChange={(event) => onDraftChange(event.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-[12px]"
          disabled={isPending}
        />
        <button
          type="button"
          disabled={isPending || !draftDate}
          onClick={() => onSave(row.id)}
          className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background disabled:opacity-60"
        >
          Salvar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={onCancel}
          className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-surface-elevated disabled:opacity-60"
        >
          Cancelar
        </button>
        {dateError ? (
          <span className="w-full text-[11px] text-red-600">{dateError}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-2">
      <p className="text-[11px] text-muted">
        {row.dueDate ? `Venc. ${formatShortDate(row.dueDate)}` : "Data pendente"}
      </p>
      <button
        type="button"
        disabled={isPending}
        onClick={() => onStartEdit(row)}
        className="text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-60"
      >
        {row.dueDate ? "Alterar data" : "Definir data"}
      </button>
    </div>
  );
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  const payableId = proposalItems?.find(
    (row) => row.status === BillingItemStatus.pending && row.dueDate,
  )?.id;
  const lastPaidId = [...(proposalItems ?? [])]
    .filter((row) => row.status === BillingItemStatus.paid)
    .sort((a, b) => b.sequence - a.sequence)[0]?.id;

  function confirm(id: string) {
    startTransition(async () => {
      await adminConfirmBillingPaymentAction(id);
    });
  }

  function revert(id: string) {
    startTransition(async () => {
      await adminRevertBillingPaymentAction(id);
    });
  }

  function startEditDueDate(row: { id: string; dueDate: string | null }) {
    setEditingId(row.id);
    setDraftDate(row.dueDate ?? "");
    setDateError(null);
  }

  function cancelEditDueDate() {
    setEditingId(null);
    setDraftDate("");
    setDateError(null);
  }

  function saveDueDate(id: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draftDate.trim())) {
      setDateError("Escolha uma data válida.");
      return;
    }
    startTransition(async () => {
      const result = await adminUpdateBillingDueDateAction(id, draftDate.trim());
      if (result && "error" in result) {
        setDateError(result.error ?? "Não foi possível salvar.");
        return;
      }
      cancelEditDueDate();
    });
  }

  const dueDateProps = {
    editingId,
    draftDate,
    dateError,
    isPending,
    onStartEdit: startEditDueDate,
    onCancel: cancelEditDueDate,
    onDraftChange: (value: string) => {
      setDraftDate(value);
      setDateError(null);
    },
    onSave: saveDueDate,
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-medium">Pagamentos pendentes</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Confirme quando o PIX cair. A primeira mensalidade fica com data pendente
          até a implantação; depois, cada vencimento é 1 mês após o anterior. Dá para
          definir ou alterar a data manualmente.
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
                  </p>
                  <DueDateControls row={row} {...dueDateProps} />
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
                  <DueDateControls row={row} {...dueDateProps} />
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
                  {row.id === lastPaidId ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => revert(row.id)}
                      className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground disabled:opacity-60"
                    >
                      Reverter
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
