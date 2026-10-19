import { Suspense } from "react";
import { BrandMark } from "@/app/components/brand-mark";

export const instant = false;

const errors: Record<string, string> = {
  "sem-acesso": "Não foi possível criar sua conta. Tente de novo.",
  cancelado: "Login cancelado.",
  invalido: "Não foi possível entrar com o Google. Tente de novo.",
  config: "Login com Google ainda não está configurado.",
  servidor:
    "Não foi possível concluir o login. Verifique DATABASE_URL e se as migrações do Prisma foram aplicadas.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; next?: string }>;
}) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BrandMark />
        </div>
        <div className="border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h1 className="text-sm font-medium">Entrar</h1>
            <p className="mt-1 text-[12px] leading-5 text-muted">
              Acesso com Google à proposta, contrato ou serviços já contratados.
            </p>
          </div>
          <Suspense>
            <LoginBody searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function LoginBody({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; next?: string }>;
}) {
  const { erro, next } = await searchParams;
  const message = erro ? errors[erro] : null;
  const returnTo =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/propostas";

  return (
    <>
      {message ? (
        <p className="px-4 pt-4 text-[12px] text-negative">{message}</p>
      ) : null}
      <div className="border-t border-border px-4 py-3">
        <a
          href={`/api/auth/google?next=${encodeURIComponent(returnTo)}`}
          className="block w-full border border-foreground bg-foreground px-3 py-1.5 text-center text-[12px] text-background"
        >
          Entrar com Google
        </a>
      </div>
    </>
  );
}
