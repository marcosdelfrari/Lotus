import { getLatestProposalForUser } from "@/lib/proposals-store";
import type { Account } from "@/lib/types";

export function safeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/propostas";
  }
  return value;
}

export async function destinationAfterLogin(
  account: Account,
  returnTo: string,
) {
  if (account.role === "admin") {
    return returnTo.startsWith("/admin") ? returnTo : "/admin";
  }

  const proposal = await getLatestProposalForUser(account.id, account.email);
  if (proposal?.status === "sent" || proposal?.status === "accepted") {
    return "/propostas";
  }
  return returnTo;
}
