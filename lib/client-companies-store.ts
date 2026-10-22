import { adminEmail, roleForEmail } from "@/lib/access-code";
import { analyticsPrisma as prisma } from "@/lib/analytics-db";

export type ClientCompanyOption = {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  planActive: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Garante org/empresa padrão para clientes legados (mesma regra do Analytics). */
export async function ensureClientOrganization(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || roleForEmail(user.email) !== "client") return;

  await prisma.organization.upsert({
    where: { id: user.id },
    create: { id: user.id, name: user.name },
    update: { name: user.name },
  });

  await prisma.company.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      organizationId: user.id,
      name: user.name,
      planActive: user.planActive,
    },
    update: {
      name: user.name,
      planActive: user.planActive,
    },
  });

  await prisma.accessGrant.upsert({
    where: {
      organizationId_email: {
        organizationId: user.id,
        email: user.email,
      },
    },
    create: {
      organizationId: user.id,
      email: user.email,
      allCompanies: true,
      isOwner: true,
    },
    update: {
      allCompanies: true,
      isOwner: true,
    },
  });
}

export async function listCompaniesForClientEmail(
  email: string,
): Promise<ClientCompanyOption[]> {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (user && roleForEmail(user.email) === "client") {
    await ensureClientOrganization(user.id);
  }

  if (roleForEmail(normalized) === "admin") {
    const companies = await prisma.company.findMany({
      orderBy: [{ organization: { name: "asc" } }, { name: "asc" }],
      include: { organization: true },
    });
    return companies.map((company) => ({
      id: company.id,
      name: company.name,
      organizationId: company.organizationId,
      organizationName: company.organization.name,
      planActive: company.planActive,
    }));
  }

  const grants = await prisma.accessGrant.findMany({
    where: { email: normalized },
    include: {
      organization: true,
      companies: { include: { company: true } },
    },
  });

  const byId = new Map<string, ClientCompanyOption>();

  for (const grant of grants) {
    if (grant.allCompanies) {
      const companies = await prisma.company.findMany({
        where: { organizationId: grant.organizationId },
        include: { organization: true },
      });
      for (const company of companies) {
        byId.set(company.id, {
          id: company.id,
          name: company.name,
          organizationId: company.organizationId,
          organizationName: company.organization.name,
          planActive: company.planActive,
        });
      }
      continue;
    }

    for (const link of grant.companies) {
      const company = link.company;
      byId.set(company.id, {
        id: company.id,
        name: company.name,
        organizationId: company.organizationId,
        organizationName: grant.organization.name,
        planActive: company.planActive,
      });
    }
  }

  return [...byId.values()].sort(
    (a, b) =>
      a.organizationName.localeCompare(b.organizationName, "pt-BR") ||
      a.name.localeCompare(b.name, "pt-BR"),
  );
}

export async function syncCompanyPlanWithUser(clientId: string, planActive: boolean) {
  await prisma.company.updateMany({
    where: { id: clientId },
    data: { planActive },
  });
}

export async function ensureAdminLotusOrganization() {
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) return;
  await ensureClientOrganization(admin.id);
}
