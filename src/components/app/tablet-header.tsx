import Link from "next/link";

export function TabletHeader({
  tabletCode,
  propertyName,
}: {
  tabletCode: string;
  propertyName?: string | null;
}) {
  const home = `/tablet/${tabletCode}`;
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/40 bg-white/55 px-5 py-3 backdrop-blur-xl">
      <Link
        href={home}
        aria-label="Início"
        className="flex items-center gap-2 rounded-full px-1 py-1 transition-opacity hover:opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/host-app-logo.svg"
          alt="hosteasy"
          className="h-5 w-auto"
          draggable={false}
        />
      </Link>
      <div className="flex items-center gap-2">
        {propertyName ? (
          <span className="hidden text-xs text-foreground/65 sm:inline">
            {propertyName}
          </span>
        ) : null}
        <span className="rounded-full bg-white/70 px-3 py-1 font-mono text-[11px] font-medium text-foreground/65 backdrop-blur">
          {tabletCode}
        </span>
      </div>
    </header>
  );
}
