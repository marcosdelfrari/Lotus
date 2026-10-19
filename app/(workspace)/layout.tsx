import { redirect } from "next/navigation";
import { AppShell } from "@/app/components/app-shell";
import { getSession } from "@/lib/auth";

export const instant = false;

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/propostas");
  }

  return <AppShell session={session}>{children}</AppShell>;
}
