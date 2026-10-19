"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminSendProposal } from "@/app/(workspace)/propostas/actions";

type Row = {
  id: string;
  companyName: string;
  userName: string;
  userEmail: string;
  segment: string;
  createdAt: string;
};

export function AdminProposalsPanel({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Nenhuma solicitação pendente.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle rounded-xl border border-border bg-surface">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{row.companyName}</p>
            <p className="text-[12px] text-muted-foreground">
              {row.userName} · {row.userEmail}
            </p>
            {row.segment ? (
              <p className="mt-1 text-[12px] text-muted">{row.segment}</p>
            ) : null}
          </div>
          <button
            type="button"
            disabled={pending}
            className="shrink-0 rounded-md border border-border px-4 py-2 text-[13px] hover:bg-background disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                await adminSendProposal(row.id);
                router.refresh();
              });
            }}
          >
            Enviar proposta
          </button>
        </li>
      ))}
    </ul>
  );
}
