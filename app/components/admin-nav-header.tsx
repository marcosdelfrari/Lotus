"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/app/components/page-header";

const items = [
  { href: "/admin/prospeccao", label: "Prospecção" },
  { href: "/admin/financeiro", label: "Financeiro" },
  { href: "/admin/clientes-ativos", label: "Clientes ativos" },
];

export function AdminNavHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const pathname = usePathname();

  return (
    <PageHeader
      title={title}
      description={description}
      actions={
        <>
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-1.5 text-[12px] ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </>
      }
    />
  );
}
