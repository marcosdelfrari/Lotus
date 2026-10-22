import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminDeleteProposalButton } from "@/app/components/admin-delete-proposal-button";
import { AdminNavHeader } from "@/app/components/admin-nav-header";
import { AdminProposalWizard } from "@/app/components/admin-proposal-wizard";
import { AdminProposalsPanel } from "@/app/components/admin-proposals-panel";
import { loadAdminClientPartitions, requireAdminSession } from "@/lib/admin-context";
import { formatDate } from "@/lib/format";
import { getInterestForUser, listInterests } from "@/lib/interests-store";
import {
  filterInterestsWithoutProposal,
  getLatestProposalForUser,
  getProposalById,
  listRequestedProposals,
} from "@/lib/proposals-store";
import { formatInterestWhen, formatWhatsapp } from "@/lib/whatsapp";

export const instant = false;

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  requested: "Solicitada",
  sent: "Enviada — aguardando aceite",
  accepted: "Aceita",
  cancelled: "Cancelada",
};

export default async function AdminProspeccaoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; proposta?: string }>;
}) {
  await requireAdminSession();
  const { cliente, proposta } = await searchParams;

  const [partitions, pending, interestsRaw, selectedProposal] = await Promise.all([
    loadAdminClientPartitions(),
    listRequestedProposals(),
    listInterests(),
    proposta ? getProposalById(proposta) : Promise.resolve(null),
  ]);

  const interests = await filterInterestsWithoutProposal(interestsRaw);

  if (selectedProposal?.status === "accepted") {
    redirect(`/admin/clientes-ativos?proposta=${selectedProposal.id}`);
  }

  const clientId = selectedProposal?.userId ?? cliente;
  const client = clientId
    ? (partitions.clients.find((row) => row.id === clientId) ?? null)
    : null;

  if (client && !proposta && partitions.acceptedByUser.has(client.id)) {
    redirect(`/admin/clientes-ativos?cliente=${client.id}`);
  }

  const [interest, latestProposal] = client
    ? await Promise.all([
        getInterestForUser(client.id),
        getLatestProposalForUser(client.id, client.email),
      ])
    : [null, null];

  const proposal =
    selectedProposal && selectedProposal.userId === client?.id
      ? selectedProposal
      : latestProposal;

  const editableProposal =
    proposal && proposal.status !== "cancelled" && proposal.status !== "accepted"
      ? proposal
      : null;

  return (
    <>
      <AdminNavHeader
        title="Prospecção"
        description="Leads, solicitações e propostas comerciais até o aceite."
      />

      <div className="space-y-8">
        {interests.length > 0 ? (
          <section>
            <h2 className="text-sm font-medium">Leads (WhatsApp)</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Entraram com Google e informaram contato — ainda sem proposta.
            </p>
            <ul className="mt-4 divide-y divide-border-subtle rounded-xl border border-border bg-surface">
              {interests.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-[12px] text-muted-foreground">{row.email}</p>
                    <p className="mt-1 text-[12px] text-muted">
                      {formatWhatsapp(row.whatsapp)} · {formatInterestWhen(row.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/admin/prospeccao?cliente=${row.userId}`}
                    className="shrink-0 rounded-full bg-foreground px-4 py-2 text-center text-[12px] font-medium text-background"
                  >
                    Montar proposta
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {pending.length > 0 ? (
          <section>
            <h2 className="text-sm font-medium">Solicitações do formulário</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Pedidos do formulário — monte a proposta em etapas.
            </p>
            <div className="mt-4">
              <AdminProposalsPanel rows={pending} />
            </div>
          </section>
        ) : null}

        {partitions.pipelineProposals.length > 0 ? (
          <section>
            <h2 className="text-sm font-medium">Propostas enviadas</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Aguardando aceite do cliente.
            </p>
            <ul className="mt-4 divide-y divide-border-subtle rounded-xl border border-border bg-surface">
              {partitions.pipelineProposals.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {row.companyName}
                      <span className="ml-2 text-[11px] font-normal uppercase tracking-wide text-muted">
                        {statusLabel[row.status] ?? row.status}
                      </span>
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {row.userName} · {row.userEmail}
                    </p>
                    <p className="mt-1 text-[12px] text-muted">
                      {row.title || "Proposta comercial"} · {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/admin/prospeccao?proposta=${row.id}`}
                      className="rounded-full bg-foreground px-4 py-2 text-center text-[12px] font-medium text-background"
                    >
                      Editar
                    </Link>
                    <AdminDeleteProposalButton
                      proposalId={row.id}
                      companyName={row.companyName}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium">Em prospecção</h2>
              <p className="text-[12px] text-muted-foreground">
                {partitions.prospectClients.length === 1
                  ? "1 cadastro"
                  : `${partitions.prospectClients.length} cadastros`}
              </p>
            </div>
            {partitions.prospectClients.length === 0 ? (
              <p className="px-4 py-6 text-[12px] text-muted-foreground">
                Ninguém em prospecção. Novos logins aparecem aqui.
              </p>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {partitions.prospectClients.map((row) => {
                  const active = row.id === client?.id;
                  return (
                    <li key={row.id}>
                      <Link
                        href={`/admin/prospeccao?cliente=${row.id}`}
                        className={`block px-4 py-3 transition-colors ${
                          active ? "bg-surface-elevated" : "hover:bg-surface-elevated/60"
                        }`}
                      >
                        <p className="truncate text-sm font-medium">{row.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {row.email}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="min-w-0 space-y-6">
            {!client ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Selecione um lead ou cliente em prospecção para montar a proposta.
              </p>
            ) : (
              <>
                <section className="rounded-xl border border-border bg-surface p-5">
                  <h2 className="text-sm font-medium">{client.name}</h2>
                  <p className="text-[12px] text-muted-foreground">{client.email}</p>
                  {interest ? (
                    <p className="mt-3 text-[13px] text-muted-foreground">
                      WhatsApp:{" "}
                      <span className="font-medium text-foreground">
                        {formatWhatsapp(interest.whatsapp)}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-3 text-[12px] text-muted">
                      WhatsApp ainda não informado.
                    </p>
                  )}
                </section>

                {proposal ? (
                  <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
                    Status: {statusLabel[proposal.status] ?? proposal.status}
                  </p>
                ) : null}

                <AdminProposalWizard
                  userId={client.id}
                  clientEmail={client.email}
                  clientName={client.name}
                  defaultCompanyName={client.name}
                  defaultContactPhone={interest ? formatWhatsapp(interest.whatsapp) : ""}
                  initialProposal={editableProposal}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
