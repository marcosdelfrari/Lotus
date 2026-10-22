import { Skeleton } from "@/app/components/skeleton";

/** Placeholder enquanto as páginas /servicos/* carregam no servidor. */
export function ServicosRouteLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando área de serviços">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#111111]/90 px-4 py-3 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg bg-white/8" />
          <Skeleton className="h-3 w-3 rounded-full bg-white/8" />
          <Skeleton className="h-4 w-36 max-w-[40vw] rounded-full bg-white/8" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full bg-white/8" />
          ))}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#161616] via-[#101010] to-[#0a0a0a] p-6 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.85)] sm:p-10"
      >
        <div className="border-b border-white/8 pb-6 sm:pb-8">
          <Skeleton className="h-3 w-40 rounded-full bg-white/8" />
          <Skeleton className="mt-4 h-9 w-full max-w-md rounded-lg bg-white/8" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl rounded-lg bg-white/8" />
          <Skeleton className="mt-2 h-4 w-[66%] max-w-sm rounded-lg bg-white/8" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-2xl bg-white/6" />
          <Skeleton className="h-28 rounded-2xl bg-white/6" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/2.5 p-5 lg:col-span-8 sm:p-6">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-3 w-32 rounded-full bg-white/8" />
              <Skeleton className="h-6 w-24 rounded-lg bg-white/8" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-4 border-t border-white/6 pt-4 first:border-0 first:pt-0">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-lg bg-white/8" />
                  <Skeleton className="h-3 w-full rounded-lg bg-white/6" />
                </div>
                <Skeleton className="h-4 w-16 shrink-0 rounded-lg bg-white/8" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 lg:col-span-4">
            <Skeleton className="h-44 rounded-2xl bg-white/5" />
            <Skeleton className="h-28 rounded-2xl bg-white/4" />
          </div>
        </div>
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
