"use client";

import Link from "next/link";
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
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
