"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/app/components/brand-mark";
import { logout } from "@/app/login/actions";
import { analyticsDashboardUrl } from "@/lib/analytics-app";
import type { Session } from "@/lib/types";

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const bare =
    pathname === "/propostas" ||
    pathname.includes("/propostas/") ||
    pathname === "/servicos" ||
    pathname.startsWith("/servicos/");
  const fullBleed = pathname === "/admin" || bare;
  const frame = fullBleed
    ? "w-full px-3.5 sm:px-8 lg:px-10"
    : "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

  return (
    <div className="flex min-h-dvh flex-col">
      {bare ? null : (
      <header className="border-b border-border bg-surface/40">
        <div className={`flex h-14 items-center gap-4 ${frame}`}>
          <BrandMark compact href="/" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{session.name}</p>
            <p className="truncate text-[11px] text-muted">{session.email}</p>
          </div>
          {session.role === "admin" ? (
            <Link
              href="/admin"
              className="hidden rounded-md border border-border px-3 py-1.5 text-[12px] font-medium sm:inline-flex"
            >
              Admin
            </Link>
          ) : session.planActive ? (
            <Link
              href={analyticsDashboardUrl()}
              className="hidden rounded-md bg-foreground px-3 py-1.5 text-[12px] font-medium text-background sm:inline-flex"
            >
              Analytics
            </Link>
          ) : null}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
            >
              Sair
            </button>
          </form>
        </div>
      </header>
      )}
      <main className={`flex-1 ${bare ? "py-3 sm:py-10" : "py-8"} ${frame}`}>{children}</main>
    </div>
  );
}
