import { roleForEmail } from "@/lib/access-code";
import { analyticsPrisma } from "@/lib/analytics-db";
import type { OrgAccessRole } from "@/lib/org-roles";
import type { Session } from "@/lib/types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isOrganizationOwnerForCompany(
  email: string,
  analyticsCompanyId: string,
) {
  const normalized = normalizeEmail(email);
  if (roleForEmail(normalized) === "admin") return true;

  const company = await analyticsPrisma.company.findUnique({
    where: { id: analyticsCompanyId },
    select: { organizationId: true },
  });
  if (!company) return false;

  const grant = await analyticsPrisma.accessGrant.findUnique({
    where: {
      organizationId_email: {
        organizationId: company.organizationId,
        email: normalized,
      },
    },
  });
  return grant?.isOwner === true;
}

export async function resolveMarketingRole(
  session: Pick<Session, "role" | "email"> | null,
  analyticsCompanyId: string,
): Promise<OrgAccessRole> {
  if (!session) return "member";
  if (session.role === "admin") return "admin";
  const owner = await isOrganizationOwnerForCompany(
    session.email,
    analyticsCompanyId,
  );
  return owner ? "owner" : "member";
}

export async function canEditMarketingPlan(
  session: Pick<Session, "role" | "email"> | null,
  analyticsCompanyId: string,
) {
  const role = await resolveMarketingRole(session, analyticsCompanyId);
  return role === "admin" || role === "owner";
}
