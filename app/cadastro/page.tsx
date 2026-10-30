import { RegisterPanel } from "@/app/components/auth-panel";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnTo =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/propostas";

  return <RegisterPanel next={returnTo} />;
}
