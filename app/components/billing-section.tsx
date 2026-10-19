"use client";

import { useState } from "react";
import { formatCurrency, formatDate, formatShortDate } from "@/lib/format";
import type { BillingItemView } from "@/lib/billing-store";
import { BillingItemStatus } from "@/lib/generated/prisma/browser";
import { LOTUS_PIX_KEY, LOTUS_PIX_LABEL, LOTUS_WHATSAPP_URL } from "@/lib/whatsapp";

export function BillingSection({ items }: { items: BillingItemView[] }) {
  const [copied, setCopied] = useState(false);
  const [showPix, setShowPix] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const pending = items.filter((row) => row.status === BillingItemStatus.pending);
  const current = pending.find((row) => row.dueDate) ?? null;

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(LOTUS_PIX_KEY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/12 bg-linear-to-br from-white/4 via-white/2 to-transparent p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
            Faturamento
          </p>
          <p className="mt-2 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
            {current
              ? `${formatCurrency(current.amount)} em aberto. Pague via PIX e envie o comprovante.`
              : "Todos os pagamentos em dia. O próximo vencimento aparece aqui."}
          </p>
        </div>

        {current && !showPix ? (
          <button
            type="button"
            onClick={() => setShowPix(true)}
            className="shrink-0 rounded-full bg-foreground px-5 py-2 text-[12px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Pagar
          </button>
        ) : null}
      </div>

      {current && showPix ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-black/30 px-4 py-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
            Chave PIX (celular)
          </p>
          <p className="mt-2 font-mono text-lg text-foreground">{LOTUS_PIX_LABEL}</p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{LOTUS_PIX_KEY}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPix}
              className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-[11px] font-medium text-foreground transition-colors hover:border-white/30 hover:bg-white/10"
            >
              {copied ? "Copiado" : "Copiar chave"}
            </button>
            <a
              href={LOTUS_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-foreground px-4 py-2 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
            >
              Enviar comprovante
            </a>
          </div>
        </div>
      ) : null}

      <ol className="mt-6 space-y-0">
        {items.map((row, index) => {
          const isCurrent = current?.id === row.id;
          const isPaid = row.status === BillingItemStatus.paid;
          const datePending = !isPaid && !row.dueDate;
          const isLast = index === items.length - 1;

          return (
            <li key={row.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast ? (
                <span
                  className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-white/10"
                  aria-hidden
                />
              ) : null}

              <span
                className={`relative z-1 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-mono ${
                  isPaid
                    ? "border-positive/40 bg-positive/15 text-positive"
                    : isCurrent
                      ? "border-amber-300/50 bg-amber-400/10 text-amber-100"
                      : "border-white/15 bg-white/5 text-muted"
                }`}
              >
                {isPaid ? "✓" : row.sequence + 1}
              </span>

              <div
                className={`min-w-0 flex-1 rounded-xl border px-4 py-3 ${
                  isCurrent
                    ? "border-amber-300/25 bg-amber-400/5"
                    : isPaid
                      ? "border-white/6 bg-white/2"
                      : "border-white/8 bg-black/20"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{row.label}</p>
                    {row.dueDate ? (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Vencimento {formatShortDate(row.dueDate)}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Data pendente — liberada após a confirmação da implantação
                      </p>
                    )}
                    {isPaid && row.paidAt ? (
                      <p className="mt-0.5 text-[11px] text-positive/90">
                        Confirmado em {formatDate(row.paidAt)}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-base tabular-nums text-foreground">
                      {formatCurrency(row.amount)}
                    </p>
                    <p
                      className={`mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                        isPaid ? "text-positive" : isCurrent ? "text-amber-200/90" : "text-muted"
                      }`}
                    >
                      {isPaid
                        ? "Pago"
                        : datePending
                          ? "Data pendente"
                          : isCurrent
                            ? "Aguardando PIX"
                            : "Próximo"}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
