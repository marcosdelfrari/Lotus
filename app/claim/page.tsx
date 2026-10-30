import { ClaimForm } from "@/app/components/claim-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Confirmar agente | Lótus",
  robots: { index: false, follow: false },
};

export const instant = false;

type Props = {
  searchParams: Promise<{ claim_attempt_token?: string }>;
};

export default async function ClaimPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.claim_attempt_token?.trim() || "";
  const session = await getSession();

  if (!session) {
    const next = token
      ? `/claim?claim_attempt_token=${encodeURIComponent(token)}`
      : "/claim";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-2xl tracking-tight">Confirmar agente</h1>
      <p className="mt-2 text-sm text-muted">
        Digite o código de 6 dígitos mostrado pelo agente para vincular o acesso à
        sua conta ({session.email}).
      </p>
      <ClaimForm claimAttemptToken={token} />
    </main>
  );
}
