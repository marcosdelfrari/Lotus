/**
 * Papéis no plano de marketing (Lótus).
 *
 * - Admin: painel /admin (operação Lótus)
 * - Proprietário: access_grants.is_owner no Analytics — edita em /servicos
 * - Usuário: convidado — só lê em /servicos
 *
 * Analytics não edita marketing; só organização/empresa para login e rastreio.
 */

export type OrgAccessRole = "admin" | "owner" | "member";

export function canEditMarketingPlan(role: OrgAccessRole) {
  return role === "admin" || role === "owner";
}

export function marketingRoleLabel(role: OrgAccessRole) {
  if (role === "admin") return "Admin Lótus";
  if (role === "owner") return "Proprietário";
  return "Usuário";
}
