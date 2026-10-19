import { redirect } from "next/navigation";
import { AdminProposalPreviewFromCache } from "@/app/components/admin-proposal-preview-from-cache";
import { getSession } from "@/lib/auth";

export const instant = false;

export default async function AdminProposalPreviewCachePage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin/propostas/preview");
  }

  return <AdminProposalPreviewFromCache />;
}
