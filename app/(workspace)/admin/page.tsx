import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCreateProposalForm } from "@/app/components/admin-create-proposal-form";
import { AdminProposalsPanel } from "@/app/components/admin-proposals-panel";
import { PageHeader } from "@/app/components/page-header";
import { ProposalSummary } from "@/app/components/proposal-summary";
import { getSession } from "@/lib/auth";
import { formatWhatsapp } from "@/lib/whatsapp";
import { getInterestForUser } from "@/lib/interests-store";
import {
  getLatestProposalForUser,
  listRequestedProposals,
} from "@/lib/proposals-store";
import { listClients } from "@/lib/users-store";

export const instant = false;

const statusLabel: Record<string, string> = {
  requested: "Solicitada",
  sent: "Enviada — aguardando aceite",
  accepted: "Aceita",
  cancelled: "Cancelada",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const { cliente } = await searchParams;
  const [clients, pending] = await Promise.all([listClients(), listRequestedProposals()]);
  const client = cliente ? (clients.find((row) => row.id === cliente) ?? null) : null;

  const [interest, proposal] = client
    ? await Promise.all([
        getInterestForUser(client.id),
        getLatestProposalForUser(client.id),
      ])
    : [null, null];

  const openProposal =
    proposal && (proposal.status === "requested" || proposal.status === "sent")
      ? proposal
      : null;

  return (
    <>
      <PageHeader
        title="Propostas de tráfego"
        description="Clientes cadastrados no mesmo login do Analytics. Crie e envie propostas para aceite."
      />

      {pending.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-sm font-medium">Solicitações do formulário</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Pedidos com status solicitado — use o pacote comercial padrão ou crie manualmente
            por cliente.
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
                <section className="space-y-4">
                  <p className="text-[12px] font-medium uppercase tracking-wide text-muted">
                    Status: {statusLabel[proposal.status] ?? proposal.status}
                  </p>
                  {proposal.status === "sent" || proposal.status === "accepted" ? (
                    <ProposalSummary proposal={proposal} />
                  ) : null}
                </section>
              ) : null}

              {openProposal?.status === "requested" ? (
                <p className="rounded-lg border border-border-subtle bg-background/50 px-4 py-3 text-[13px] text-muted-foreground">
                  Há uma solicitação aberta para {openProposal.companyName}. Use a lista acima
                  para enviar o pacote padrão ou aguarde e edite pelo fluxo manual abaixo após
                  cancelar.
                </p>
              ) : null}

              {!openProposal ? (
                <AdminCreateProposalForm
                  userId={client.id}
                  defaultCompanyName={client.name}
                  defaultContactPhone={interest ? formatWhatsapp(interest.whatsapp) : ""}
                />
              ) : openProposal.status === "sent" ? (
                <p className="text-[13px] text-muted-foreground">
                  Proposta enviada. O cliente aceita em{" "}
                  <Link href="/propostas" className="underline underline-offset-2">
                    /propostas
                  </Link>
                  .
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}
