import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  compact = false,
  href = "/",
  priority = false,
}: {
  compact?: boolean;
  href?: string;
  priority?: boolean;
}) {
  const size = compact ? 28 : 36;
  return (
    <Link href={href} className="inline-flex shrink-0 cursor-pointer items-center gap-2" aria-label="Lótus">
      <Image
        src="/lotuslogo.webp"
        alt=""
        width={size}
        height={size}
        priority={priority}
        className={`rounded-full ${compact ? "h-7 w-7" : "h-9 w-9"}`}
      />
      {!compact && (
        <span className="text-base font-thin tracking-wide text-foreground">Lótus</span>
      )}
    </Link>
  );
}
