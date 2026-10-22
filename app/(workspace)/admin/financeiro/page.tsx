import Link from "next/link";
import { AdminBillingPanel } from "@/app/components/admin-billing-panel";
import { AdminNavHeader } from "@/app/components/admin-nav-header";
import { loadAdminClientPartitions, requireAdminSession } from "@/lib/admin-context";
import {
  ensureBillingForAcceptedProposals,
  listAllBillingForAdmin,
  listPendingBillingForAdmin,
} from "@/lib/billing-store";

export const instant = false;

export default async function AdminFinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; proposta?: string }>;
}) {
  await requireAdminSession();
  const { cliente, proposta } = await searchParams;

  await ensureBillingForAcceptedProposals();
  const [partitions, pending] = await Promise.all([
    loadAdminClientPartitions(),
    listPendingBillingForAdmin(),
  ]);

  const activeProposal = proposta
    ? (partitions.acceptedProposals.find((row) => row.id === proposta) ?? null)
    : cliente
      ? (partitions.acceptedByUser.get(cliente) ?? null)
      : null;

  const client = activeProposal
    ? (partitions.clients.find((row) => row.id === activeProposal.userId) ?? null)
    : null;

  const proposalItemsRaw = activeProposal
    ? await listAllBillingForAdmin(activeProposal.id)
    : [];

  const proposalItems =
    proposalItemsRaw.length > 0 && activeProposal
      ? proposalItemsRaw.map((row) => ({
          ...row,
          companyName: activeProposal.companyName,
          clientName: client?.name ?? "",
          clientEmail: client?.email ?? "",
        }))
      : undefined;

  const filteredPending = activeProposal
    ? pending.filter((row) => row.proposalId === activeProposal.id)
    : pending;

  return (
    <>
      <AdminNavHeader
        title="Financeiro"
        description="Implantação e mensalidades dos contratos aceitos. Confirme pagamentos recebidos."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Contratos</h2>
            <p className="text-[12px] text-muted-foreground">
              Filtra pendências e histórico
            </p>
          </div>
          <ul className="divide-y divide-border-subtle">
            <li>
              <Link
                href="/admin/financeiro"
                className={`block px-4 py-3 text-[13px] transition-colors ${
                  !activeProposal
                    ? "bg-surface-elevated font-medium"
                    : "hover:bg-surface-elevated/60"
                }`}
              >
                Todos os pendentes
              </Link>
            </li>
            {partitions.acceptedProposals.map((row) => {
              const active = row.id === activeProposal?.id;
              return (
                <li key={row.id}>
                  <Link
                    href={`/admin/financeiro?proposta=${row.id}`}
                    className={`block px-4 py-3 transition-colors ${
                      active ? "bg-surface-elevated" : "hover:bg-surface-elevated/60"
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{row.companyName}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {row.userName}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="min-w-0">
          <AdminBillingPanel
            pending={filteredPending}
            proposalItems={proposalItems}
            proposalCompanyName={activeProposal?.companyName}
          />
        </div>
      </div>
    </>
  );
}
