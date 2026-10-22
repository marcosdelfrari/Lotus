import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-context";

export const instant = false;

export default async function AdminIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; lista?: string; proposta?: string }>;
}) {
  await requireAdminSession();
  const { cliente, lista, proposta } = await searchParams;

  const qs = new URLSearchParams();
  if (cliente) qs.set("cliente", cliente);
  if (proposta) qs.set("proposta", proposta);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  if (lista === "faturamento" || lista === "financeiro") {
    redirect(`/admin/financeiro${suffix}`);
  }
  if (lista === "ativos" || lista === "enviadas") {
    redirect(`/admin/clientes-ativos${suffix}`);
  }
  redirect(`/admin/prospeccao${suffix}`);
}
