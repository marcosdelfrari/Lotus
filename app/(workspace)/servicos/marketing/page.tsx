import { ClientMarketingPlanSection } from "@/app/components/client-marketing-plan-section";
import { ServicosTopBar } from "@/app/components/servicos-top-bar";
import { listCompaniesForClientEmail } from "@/lib/client-companies-store";
import { resolveMarketingRole } from "@/lib/marketing-access";
import { listMarketingPlansForProposal } from "@/lib/marketing-plans-store";
import { requireAcceptedClientContext } from "@/lib/servicos-context";

export const instant = false;

export default async function ServicosMarketingPage() {
  const { session, proposal } = await requireAcceptedClientContext();

  const companies = await listCompaniesForClientEmail(session.email);
  const defaultCompany =
    companies.find(
      (c) =>
        c.name.trim().toLowerCase() === proposal.companyName.trim().toLowerCase(),
    ) ?? companies[0];

  const [marketingPlans, marketingRole] = await Promise.all([
    listMarketingPlansForProposal(proposal.id),
    defaultCompany
      ? resolveMarketingRole(session, defaultCompany.id)
      : Promise.resolve("member" as const),
  ]);

  return (
    <div className="space-y-6">
      <ServicosTopBar companyName={proposal.companyName} />

      <ClientMarketingPlanSection
        proposalId={proposal.id}
        proposalCompanyName={proposal.companyName}
        companies={companies}
        savedPlans={marketingPlans}
        role={marketingRole}
      />
    </div>
  );
}
