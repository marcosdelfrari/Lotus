import { Skeleton } from "@/app/components/skeleton";

/** Placeholder enquanto as páginas /admin/* carregam no servidor. */
export function AdminRouteLoading() {
  return (
    <div role="status" aria-label="Carregando área administrativa">
      <header className="mb-10 border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="w-full max-w-2xl space-y-2">
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-4 w-full max-w-xl bg-white/8" />
            <Skeleton className="h-4 w-[80%] max-w-lg bg-white/6" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-surface">
          <div className="space-y-2 border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-3 w-20 bg-white/8" />
          </div>
          <ul className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="space-y-2 px-4 py-3">
                <Skeleton className="h-4 w-full bg-white/10" />
                <Skeleton className="h-3 w-[85%] bg-white/6" />
              </li>
            ))}
          </ul>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-3 w-40 bg-white/8" />
            <Skeleton className="mt-3 h-5 w-56 bg-white/10" />
            <Skeleton className="mt-2 h-4 w-full max-w-md bg-white/6" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-full bg-white/8" />
              <Skeleton className="h-8 w-28 rounded-full bg-white/8" />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-4 w-36 bg-white/10" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg bg-white/6" />
            ))}
            <Skeleton className="h-10 w-32 rounded-full bg-white/10" />
          </section>
        </div>
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
