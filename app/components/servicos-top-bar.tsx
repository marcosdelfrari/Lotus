"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { LOTUS_ANALYTICS_URL } from "@/lib/analytics-app";

const tabs = [
  { href: "/servicos", label: "Dashboard", exact: true },
  { href: "/servicos/financeiro", label: "Financeiro", exact: false },
  { href: "/servicos/marketing", label: "Marketing", exact: false },
];

export function ServicosTopBar({ companyName }: { companyName: string }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#111111]/90 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <BrandMark compact href="/" />
        <span className="text-white/15">/</span>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-positive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          <span className="max-w-xs truncate text-xs font-medium text-foreground">
            {companyName}
          </span>
        </div>
      </div>

      <nav className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full border px-3.5 py-1.5 text-[11px] transition-colors ${
                active
                  ? "border-foreground bg-foreground font-medium text-background"
                  : "border-white/12 bg-white/3 text-muted-foreground hover:border-white/25 hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
        <Link
          href="/servicos/contrato"
          className={`rounded-full border px-3.5 py-1.5 text-[11px] transition-colors ${
            pathname.startsWith("/servicos/contrato")
              ? "border-foreground bg-foreground font-medium text-background"
              : "border-white/10 bg-white/3 text-muted-foreground hover:border-white/25 hover:text-foreground"
          }`}
        >
          Contrato
        </Link>
        <a
          href={LOTUS_ANALYTICS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
        >
          Analytics
        </a>
      </nav>
    </div>
  );
}
