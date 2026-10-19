import Image from "next/image";
import Link from "next/link";

export function LotusFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/lotuslogo.webp"
              alt="Lótus"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-base font-thin tracking-wide">Lótus</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Gestão de tráfego pago para empresas que querem vender com método —
            Google Ads, Meta Ads e leitura clara do resultado. Uma tecnologia{" "}
            <a
              href="https://marcosdelfrari.com"
              className="text-foreground underline-offset-2 hover:underline"
            >
              marcosdelfrari.com
            </a>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <a href="#servicos" className="hover:text-foreground">
            O que fazemos
          </a>
          <a href="#como-funciona" className="hover:text-foreground">
            Como funciona
          </a>
          <Link href="/login?next=/propostas" className="hover:text-foreground">
            Começar agora
          </Link>
        </div>
      </div>
      <div className="border-t border-border-subtle">
        <p className="mx-auto max-w-6xl px-4 py-6 text-[12px] text-muted sm:px-6 lg:px-8">
          © 2026 Lótus. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
