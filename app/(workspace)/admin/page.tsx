import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminBillingPanel } from "@/app/components/admin-billing-panel";
import { AdminDeleteProposalButton } from "@/app/components/admin-delete-proposal-button";
import { AdminProposalWizard } from "@/app/components/admin-proposal-wizard";
import { AdminProposalsPanel } from "@/app/components/admin-proposals-panel";
import { PageHeader } from "@/app/components/page-header";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { formatInterestWhen, formatWhatsapp } from "@/lib/whatsapp";
import { getInterestForUser, listInterests } from "@/lib/interests-store";
import {
  filterInterestsWithoutProposal,
  getLatestProposalForUser,
  getProposalById,
  listRequestedProposals,
  listSentAndAcceptedProposals,
} from "@/lib/proposals-store";
import {
  ensureBillingForAcceptedProposals,
  listAllBillingForAdmin,
  listPendingBillingForAdmin,
} from "@/lib/billing-store";
import { listClients } from "@/lib/users-store";

export const instant = false;

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  requested: "Solicitada",
  sent: "Enviada — aguardando aceite",
  accepted: "Aceita",
  cancelled: "Cancelada",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; lista?: string; proposta?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const { cliente, lista, proposta } = await searchParams;
  const view =
    lista === "enviadas"
      ? "enviadas"
      : lista === "solicitacoes"
        ? "solicitacoes"
        : lista === "faturamento"
          ? "faturamento"
          : "clientes";
  const [clients, pending, published, interestsRaw, selectedProposal, billingPending] =
    await Promise.all([
    listClients(),
    listRequestedProposals(),
    listSentAndAcceptedProposals(),
    listInterests(),
    proposta ? getProposalById(proposta) : Promise.resolve(null),
    listPendingBillingForAdmin(),
  ]);
  if (view === "faturamento") {
    await ensureBillingForAcceptedProposals();
  }
  const interests = await filterInterestsWithoutProposal(interestsRaw);
  const clientId = selectedProposal?.userId ?? cliente;
  const client = clientId ? (clients.find((row) => row.id === clientId) ?? null) : null;

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
    proposal && proposal.status !== "cancelled" ? proposal : null;

  const proposalBilling =
    proposal?.status === "accepted"
      ? await listAllBillingForAdmin(proposal.id)
      : [];
  const proposalBillingRows =
    proposalBilling.length > 0
      ? proposalBilling.map((row) => ({
          ...row,
          companyName: proposal!.companyName,
          clientName: client?.name ?? "",
          clientEmail: client?.email ?? "",
        }))
      : [];

  return (
    <>
      <PageHeader
        title="Propostas de tráfego"
        description="Clientes cadastrados no mesmo login do Analytics. Crie, envie e edite propostas."
        actions={
          <>
            <Link
              href="/admin"
              className={`rounded-full border px-4 py-1.5 text-[12px] ${
                view === "clientes"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
              }`}
            >
              Clientes
            </Link>
            <Link
              href="/admin?lista=solicitacoes"
              className={`rounded-full border px-4 py-1.5 text-[12px] ${
                view === "solicitacoes"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
              }`}
            >
              Solicitações
            </Link>
            <Link
              href="/admin?lista=enviadas"
              className={`rounded-full border px-4 py-1.5 text-[12px] ${
                view === "enviadas"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
              }`}
            >
              Enviadas e aceitas
            </Link>
            <Link
              href="/admin?lista=faturamento"
              className={`rounded-full border px-4 py-1.5 text-[12px] ${
                view === "faturamento"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground"
              }`}
            >
              Faturamento
            </Link>
          </>
        }
      />

      {view === "faturamento" ? (
        <AdminBillingPanel pending={billingPending} />
      ) : view === "solicitacoes" ? (
        <section>
          {interests.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma solicitação ainda. Aparecem aqui quando alguém entra com Google e informa o WhatsApp.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-xl border border-border bg-surface">
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
                    href={`/admin?cliente=${row.userId}`}
                    className="shrink-0 rounded-full bg-foreground px-4 py-2 text-center text-[12px] font-medium text-background"
                  >
                    Montar proposta
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : view === "enviadas" ? (
        <section>
          {published.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma proposta enviada ou aceita ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle rounded-xl border border-border bg-surface">
              {published.map((row) => (
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
                      href={`/admin?proposta=${row.id}`}
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
          )}
        </section>
      ) : (
        <>

      {pending.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-sm font-medium">Solicitações do formulário</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Pedidos do formulário — monte a proposta em etapas ou envie o pacote padrão.
          </p>
          <div className="mt-4">
            <AdminProposalsPanel rows={pending} />
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Clientes</h2>
            <p className="text-[12px] text-muted-foreground">
              {clients.length === 1 ? "1 cadastro" : `${clients.length} cadastros`}
            </p>
          </div>
          {clients.length === 0 ? (
            <p className="px-4 py-6 text-[12px] text-muted-foreground">
              Nenhum cliente ainda. Contas aparecem quando alguém entra com Google.
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {clients.map((row) => {
                const active = row.id === client?.id;
                return (
                  <li key={row.id}>
                    <Link
                      href={`/admin?cliente=${row.id}`}
                      className={`block px-4 py-3 transition-colors ${
                        active ? "bg-surface-elevated" : "hover:bg-surface-elevated/60"
                      }`}
                    >
                      <p className="truncate text-sm font-medium">{row.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{row.email}</p>
                      <p className="mt-1 text-[11px] text-muted">
                        {row.planActive ? "Plano ativo" : "Sem plano Pro"}
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
              Selecione um cliente para montar ou acompanhar a proposta.
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
                  <p className="mt-3 text-[12px] text-muted">WhatsApp ainda não informado.</p>
                )}
              </section>

              {proposal ? (
                <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
                  Status: {statusLabel[proposal.status] ?? proposal.status}
                </p>
              ) : null}

              {proposal?.status === "accepted" && proposalBillingRows.length > 0 ? (
                <section className="rounded-xl border border-border bg-surface p-5">
                  <AdminBillingPanel
                    pending={billingPending.filter(
                      (row) => row.proposalId === proposal.id,
                    )}
                    proposalItems={proposalBillingRows}
                    proposalCompanyName={proposal.companyName}
                  />
                </section>
              ) : null}

              {editableProposal || !proposal ? (
                <AdminProposalWizard
                  userId={client.id}
                  clientEmail={client.email}
                  clientName={client.name}
                  defaultCompanyName={client.name}
                  defaultContactPhone={interest ? formatWhatsapp(interest.whatsapp) : ""}
                  initialProposal={editableProposal}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
        </>
      )}
    </>
  );
}
