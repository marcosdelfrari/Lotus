import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNavHeader } from "@/app/components/admin-nav-header";
import { AdminPostHiringCampaignPanel } from "@/app/components/admin-post-hiring-campaign-panel";
import { loadAdminClientPartitions, requireAdminSession } from "@/lib/admin-context";
import { listCompaniesForClientEmail } from "@/lib/client-companies-store";
import { formatDate } from "@/lib/format";
import { getInterestForUser } from "@/lib/interests-store";
import { getMarketingPlanForProposal } from "@/lib/marketing-plans-store";
import { getProposalById } from "@/lib/proposals-store";
import { formatWhatsapp } from "@/lib/whatsapp";

export const instant = false;

export default async function AdminClientesAtivosPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; proposta?: string }>;
}) {
  await requireAdminSession();
  const { cliente, proposta } = await searchParams;

  const [partitions, selectedProposal] = await Promise.all([
    loadAdminClientPartitions(),
    proposta ? getProposalById(proposta) : Promise.resolve(null),
  ]);

  if (selectedProposal && selectedProposal.status !== "accepted") {
    redirect(`/admin/prospeccao?proposta=${selectedProposal.id}`);
  }

  const clientId =
    selectedProposal?.userId ??
    cliente ??
    partitions.activeClients[0]?.id ??
    null;

  const client = clientId
    ? (partitions.clients.find((row) => row.id === clientId) ?? null)
    : null;

  if (client && !partitions.acceptedByUser.has(client.id)) {
    redirect(`/admin/prospeccao?cliente=${client.id}`);
  }

  const acceptedRow = client ? partitions.acceptedByUser.get(client.id) : null;
  const proposal =
    selectedProposal ?? (acceptedRow ? await getProposalById(acceptedRow.id) : null);

  const [interest, companies, savedPlan] =
    client && proposal
      ? await Promise.all([
          getInterestForUser(client.id),
          listCompaniesForClientEmail(client.email),
          getMarketingPlanForProposal(proposal.id),
        ])
      : [null, [], null];

  return (
    <>
      <AdminNavHeader
        title="Clientes ativos"
        description="Plano de marketing e funil de aquisição por empresa. Para cobranças, use a aba Financeiro."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Clientes ativos</h2>
            <p className="text-[12px] text-muted-foreground">
              {partitions.activeClients.length === 1
                ? "1 contrato"
                : `${partitions.activeClients.length} contratos`}
            </p>
          </div>
          {partitions.activeClients.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-muted-foreground">
              Nenhum cliente com proposta aceita ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {partitions.activeClients.map((row) => {
                const active = row.id === client?.id;
                const contract = partitions.acceptedByUser.get(row.id);
                return (
                  <li key={row.id}>
                    <Link
                      href={`/admin/clientes-ativos?cliente=${row.id}`}
                      className={`block px-4 py-3 transition-colors ${
                        active ? "bg-surface-elevated" : "hover:bg-surface-elevated/60"
                      }`}
                    >
                      <p className="truncate text-sm font-medium">
                        {contract?.companyName ?? row.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {row.name} · {row.email}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="min-w-0 space-y-6">
          {!client || !proposal ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Selecione um cliente ativo para configurar o plano de marketing.
            </p>
          ) : (
            <>
              <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">
                    Contrato aceito ·{" "}
                    {formatDate(proposal.acceptedAt ?? proposal.createdAt)}
                  </p>
                  <h2 className="mt-1 text-sm font-medium">{proposal.companyName}</h2>
                  <p className="text-[12px] text-muted-foreground">
                    {client.name} · {client.email}
                  </p>
                  {interest ? (
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      WhatsApp: {formatWhatsapp(interest.whatsapp)}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/financeiro?proposta=${proposal.id}`}
                    className="rounded-full border border-border px-4 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
                  >
                    Ver financeiro
                  </Link>
                  <Link
                    href={`/admin/propostas/${proposal.id}/preview`}
                    className="rounded-full border border-border px-4 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
                  >
                    Ver proposta
                  </Link>
                </div>
              </section>

              <AdminPostHiringCampaignPanel
                trafficProposalId={proposal.id}
                proposalCompanyName={proposal.companyName}
                companies={companies}
                initialPlan={savedPlan}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
