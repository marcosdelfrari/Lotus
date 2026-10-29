import {
  BillingItemKind,
  BillingItemStatus,
  ProposalStatus,
} from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { proposalTotalServices, toProposalView } from "@/lib/proposal-types";

export type BillingItemView = {
  id: string;
  proposalId: string;
  kind: BillingItemKind;
  label: string;
  amount: number;
  dueDate: string | null;
  status: BillingItemStatus;
  paidAt: string | null;
  sequence: number;
};

export type BillingItemWithClient = BillingItemView & {
  companyName: string;
  clientName: string;
  clientEmail: string;
};

function toBillingView(row: {
  id: string;
  proposalId: string;
  kind: BillingItemKind;
  label: string;
  amount: number;
  dueDate: Date | null;
  status: BillingItemStatus;
  paidAt: Date | null;
  sequence: number;
}): BillingItemView {
  return {
    id: row.id,
    proposalId: row.proposalId,
    kind: row.kind,
    label: row.label,
    amount: row.amount,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    status: row.status,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
    sequence: row.sequence,
  };
}

function addCalendarMonth(from: Date): Date {
  const next = new Date(from);
  next.setMonth(next.getMonth() + 1);
  return next;
}

function dateOnly(value: Date | string): Date {
  if (typeof value === "string") {
    return new Date(`${value.slice(0, 10)}T12:00:00.000Z`);
  }
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate(), 12),
  );
}

async function createMonthly(input: {
  proposalId: string;
  amount: number;
  sequence: number;
  dueDate: Date | null;
}) {
  return prisma.proposalBillingItem.create({
    data: {
      proposalId: input.proposalId,
      kind: BillingItemKind.monthly,
      label: "Mensalidade da gestão",
      amount: input.amount,
      dueDate: input.dueDate,
      sequence: input.sequence,
    },
  });
}

/**
 * Mantém a implantação e sempre a próxima mensalidade visível.
 * A 1ª mensalidade fica sem data até a implantação ser confirmada;
 * depois, cada vencimento é 1 mês após o vencimento anterior.
 */
export async function ensureInitialBillingForProposal(proposalId: string) {
  const row = await prisma.trafficProposal.findUnique({
    where: { id: proposalId },
  });
  if (!row || row.status !== ProposalStatus.accepted) return;

  const proposal = toProposalView(row);
  const monthlyAmount = proposalTotalServices(proposal);
  const setupAmount = proposal.setupFee ?? 0;
  const acceptedDay = proposal.acceptedAt
    ? dateOnly(proposal.acceptedAt)
    : dateOnly(new Date());

  if (setupAmount > 0) {
    const setup = await prisma.proposalBillingItem.findFirst({
      where: { proposalId, kind: BillingItemKind.setup },
    });
    if (!setup) {
      await prisma.proposalBillingItem.create({
        data: {
          proposalId,
          kind: BillingItemKind.setup,
          label: "Implantação",
          amount: setupAmount,
          dueDate: acceptedDay,
          sequence: 0,
        },
      });
    }
  }

  if (monthlyAmount <= 0) return;

  const setup = await prisma.proposalBillingItem.findFirst({
    where: { proposalId, kind: BillingItemKind.setup },
  });
  const setupOpen = Boolean(setup && setup.status !== BillingItemStatus.paid);

  let monthlies = await prisma.proposalBillingItem.findMany({
    where: { proposalId, kind: BillingItemKind.monthly },
    orderBy: { sequence: "asc" },
  });

  if (setupOpen) {
    const first = monthlies.find((item) => item.sequence === 1);
    if (!first) {
      await createMonthly({
        proposalId,
        amount: monthlyAmount,
        sequence: 1,
        dueDate: null,
      });
    }
    return;
  }

  const anchor = setup?.dueDate ? dateOnly(setup.dueDate) : acceptedDay;
  let first = monthlies.find((item) => item.sequence === 1);
  if (!first) {
    first = await createMonthly({
      proposalId,
      amount: monthlyAmount,
      sequence: 1,
      dueDate: addCalendarMonth(anchor),
    });
    monthlies = [...monthlies, first];
  } else if (!first.dueDate && first.status !== BillingItemStatus.paid) {
    first = await prisma.proposalBillingItem.update({
      where: { id: first.id },
      data: { dueDate: addCalendarMonth(anchor), amount: monthlyAmount },
    });
    monthlies = monthlies.map((item) => (item.id === first!.id ? first! : item));
  }

  const firstUnpaid = monthlies.find((item) => item.status !== BillingItemStatus.paid);
  if (!firstUnpaid) {
    const last = monthlies[monthlies.length - 1];
    if (!last?.dueDate) return;
    const nextSequence = last.sequence + 1;
    if (monthlies.some((item) => item.sequence === nextSequence)) return;
    await createMonthly({
      proposalId,
      amount: monthlyAmount,
      sequence: nextSequence,
      dueDate: addCalendarMonth(dateOnly(last.dueDate)),
    });
    return;
  }

  if (!firstUnpaid.dueDate) return;

  const lookaheadSequence = firstUnpaid.sequence + 1;
  if (monthlies.some((item) => item.sequence === lookaheadSequence)) return;
  await createMonthly({
    proposalId,
    amount: monthlyAmount,
    sequence: lookaheadSequence,
    dueDate: addCalendarMonth(dateOnly(firstUnpaid.dueDate)),
  });
}

export async function listBillingForProposal(proposalId: string) {
  const rows = await prisma.proposalBillingItem.findMany({
    where: { proposalId },
    orderBy: [{ sequence: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toBillingView);
}

export async function listPendingBillingForAdmin() {
  await ensureBillingForAcceptedProposals();
  const rows = await prisma.proposalBillingItem.findMany({
    where: {
      status: BillingItemStatus.pending,
      dueDate: { not: null },
    },
    orderBy: [{ dueDate: "asc" }, { sequence: "asc" }],
    include: {
      proposal: {
        select: {
          companyName: true,
          clientName: true,
          clientEmail: true,
        },
      },
    },
  });

  const earliestPending = new Map<string, number>();
  for (const row of rows) {
    const current = earliestPending.get(row.proposalId);
    if (current == null || row.sequence < current) {
      earliestPending.set(row.proposalId, row.sequence);
    }
  }

  return rows
    .filter((row) => earliestPending.get(row.proposalId) === row.sequence)
    .map((row) => ({
      ...toBillingView(row),
      companyName: row.proposal.companyName,
      clientName: row.proposal.clientName,
      clientEmail: row.proposal.clientEmail,
    }));
}

export async function listAllBillingForAdmin(proposalId: string) {
  await ensureInitialBillingForProposal(proposalId);
  return listBillingForProposal(proposalId);
}

export async function confirmBillingPayment(billingItemId: string) {
  const item = await prisma.proposalBillingItem.findUnique({
    where: { id: billingItemId },
    include: { proposal: true },
  });

  if (!item) {
    return { error: "Fatura não encontrada." } as const;
  }
  if (item.status === BillingItemStatus.paid) {
    return { error: "Este pagamento já foi confirmado." } as const;
  }
  if (item.proposal.status !== ProposalStatus.accepted) {
    return { error: "Proposta não está aceita." } as const;
  }
  if (!item.dueDate) {
    return { error: "Esta fatura ainda não tem vencimento." } as const;
  }

  const earlierOpen = await prisma.proposalBillingItem.findFirst({
    where: {
      proposalId: item.proposalId,
      status: BillingItemStatus.pending,
      sequence: { lt: item.sequence },
    },
  });
  if (earlierOpen) {
    return { error: "Confirme o pagamento anterior antes deste." } as const;
  }

  await prisma.proposalBillingItem.update({
    where: { id: billingItemId },
    data: {
      status: BillingItemStatus.paid,
      paidAt: new Date(),
    },
  });

  await ensureInitialBillingForProposal(item.proposalId);

  return { ok: true as const };
}

export async function revertBillingPayment(billingItemId: string) {
  const item = await prisma.proposalBillingItem.findUnique({
    where: { id: billingItemId },
    include: { proposal: true },
  });

  if (!item) {
    return { error: "Fatura não encontrada." } as const;
  }
  if (item.status !== BillingItemStatus.paid) {
    return { error: "Este pagamento não está confirmado." } as const;
  }
  if (item.proposal.status !== ProposalStatus.accepted) {
    return { error: "Proposta não está aceita." } as const;
  }

  const laterPaid = await prisma.proposalBillingItem.findFirst({
    where: {
      proposalId: item.proposalId,
      status: BillingItemStatus.paid,
      sequence: { gt: item.sequence },
    },
  });
  if (laterPaid) {
    return {
      error: "Reverta o pagamento mais recente antes deste.",
    } as const;
  }

  await prisma.proposalBillingItem.update({
    where: { id: billingItemId },
    data: {
      status: BillingItemStatus.pending,
      paidAt: null,
    },
  });

  if (item.kind === BillingItemKind.setup) {
    await prisma.proposalBillingItem.updateMany({
      where: {
        proposalId: item.proposalId,
        kind: BillingItemKind.monthly,
        status: BillingItemStatus.pending,
      },
      data: { dueDate: null },
    });
    await prisma.proposalBillingItem.deleteMany({
      where: {
        proposalId: item.proposalId,
        kind: BillingItemKind.monthly,
        status: BillingItemStatus.pending,
        sequence: { gt: 1 },
      },
    });
  }

  await ensureInitialBillingForProposal(item.proposalId);

  return { ok: true as const };
}

/** Repara propostas aceitas antigas sem faturamento. */
export async function ensureBillingForAcceptedProposals() {
  const accepted = await prisma.trafficProposal.findMany({
    where: { status: ProposalStatus.accepted },
    select: { id: true },
  });
  for (const row of accepted) {
    await ensureInitialBillingForProposal(row.id);
  }
}
