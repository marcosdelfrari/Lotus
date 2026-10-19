"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminDeleteProposalAction } from "@/app/(workspace)/admin/actions";

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function AdminDeleteProposalButton({
  proposalId,
  companyName,
}: {
  proposalId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, pending]);

  function close() {
    if (pending) return;
    setOpen(false);
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteProposalAction(proposalId);
      if ("error" in result) {
        setError(result.error ?? "Não foi possível remover a proposta.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Remover proposta"
        title="Remover proposta"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-negative/40 hover:bg-negative/10 hover:text-negative"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <TrashIcon />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-proposal-title"
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
              Enviadas e aceitas
            </p>
            <h2 id="delete-proposal-title" className="mt-3 text-lg font-medium">
              Remover proposta
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
              A proposta de {companyName} sai da lista e deixa de aparecer para o cliente.
            </p>
            {error ? <p className="mt-3 text-[13px] text-negative">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={close}
                className="rounded-full border border-border px-4 py-2 text-[13px] text-muted-foreground hover:bg-surface-elevated disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className="rounded-full bg-negative px-4 py-2 text-[13px] font-medium text-background disabled:opacity-50"
              >
                {pending ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
