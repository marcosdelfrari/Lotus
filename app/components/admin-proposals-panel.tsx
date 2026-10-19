"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { adminSendProposal } from "@/app/(workspace)/propostas/actions";

type Row = {
  id: string;
  userId: string;
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
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href={`/admin?cliente=${row.userId}`}
              className="rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background"
            >
              Montar proposta
            </Link>
            <button
              type="button"
              disabled={pending}
              className="rounded-md border border-border px-4 py-2 text-[13px] hover:bg-background disabled:opacity-50"
              onClick={() => {
                startTransition(async () => {
                  await adminSendProposal(row.id);
                  router.refresh();
                });
              }}
            >
              Enviar padrão
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
