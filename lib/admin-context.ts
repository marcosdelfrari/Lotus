import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listSentAndAcceptedProposals } from "@/lib/proposals-store";
import { listClients } from "@/lib/users-store";

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin/prospeccao");
  }
  return session;
}

export async function loadAdminClientPartitions() {
  const [clients, published] = await Promise.all([
    listClients(),
    listSentAndAcceptedProposals(),
  ]);

  const acceptedByUser = new Map<string, (typeof published)[number]>();
  for (const row of published) {
    if (row.status !== "accepted") continue;
    const prev = acceptedByUser.get(row.userId);
    const rowAt = row.acceptedAt ?? row.createdAt;
    const prevAt = prev ? (prev.acceptedAt ?? prev.createdAt) : "";
    if (!prev || rowAt > prevAt) {
      acceptedByUser.set(row.userId, row);
    }
  }

  return {
    clients,
    published,
    acceptedByUser,
    prospectClients: clients.filter((row) => !acceptedByUser.has(row.id)),
    activeClients: clients.filter((row) => acceptedByUser.has(row.id)),
    pipelineProposals: published.filter((row) => row.status !== "accepted"),
    acceptedProposals: published.filter((row) => row.status === "accepted"),
  };
}
