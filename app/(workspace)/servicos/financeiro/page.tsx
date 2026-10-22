import { BillingSection } from "@/app/components/billing-section";
import { ServicosTopBar } from "@/app/components/servicos-top-bar";
import {
  ensureInitialBillingForProposal,
  listBillingForProposal,
} from "@/lib/billing-store";
import { requireAcceptedClientContext } from "@/lib/servicos-context";

export const instant = false;

export default async function ServicosFinanceiroPage() {
  const { proposal } = await requireAcceptedClientContext();

  await ensureInitialBillingForProposal(proposal.id);
  const billingItems = await listBillingForProposal(proposal.id);

  return (
    <div className="space-y-6">
      <ServicosTopBar companyName={proposal.companyName} />

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-6 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-10">
        <div className="border-b border-white/8 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted">
            Financeiro
          </p>
          <h1 className="mt-2 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
            Implantação e mensalidades
          </h1>
          <p className="mt-2 max-w-xl text-xs font-light text-muted-foreground sm:text-sm">
            Contrato de <span className="text-foreground">{proposal.companyName}</span>.
          </p>
        </div>

        <div className="mt-6">
          <BillingSection items={billingItems} />
        </div>
      </div>
    </div>
  );
}
