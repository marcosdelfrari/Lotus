import { redirect } from "next/navigation";
import { ProposalClientFlow } from "@/app/components/proposal-client-flow";
import { getSession } from "@/lib/auth";
import { getProposalById } from "@/lib/proposals-store";

export const instant = false;

export default async function AdminProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?next=/admin");
  }

  const { id } = await params;
  const proposal = await getProposalById(id);
  if (!proposal) {
    redirect("/admin");
  }

  return <ProposalClientFlow proposal={proposal} previewMode />;
}
