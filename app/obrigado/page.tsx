import { BrandMark } from "@/app/components/brand-mark";

export default function ObrigadoPage() {
  return (
    <main className="flex min-h-dvh flex-col px-6 py-8 sm:px-10">
      <BrandMark />
      <div className="flex flex-1 flex-col justify-center py-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-muted">Obrigado</p>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
          O próximo cliente já está mais perto.
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
          A conversa no WhatsApp é o começo. Daqui pra frente, anúncio vira demanda com método.
        </p>
      </div>
    </main>
  );
}
