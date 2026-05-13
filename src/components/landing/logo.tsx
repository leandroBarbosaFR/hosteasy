export function Logo({
  className,
  tone = "primary",
}: {
  className?: string;
  tone?: "primary" | "light";
}) {
  const stroke = tone === "light" ? "#ffffff" : "currentColor";
  const ring = tone === "light" ? "#ffffff" : "var(--color-primary)";
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="14" stroke={ring} strokeWidth="2" />
      <path
        d="M11 19c1.6 1.6 4.4 1.6 6 0"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="13" r="1.3" fill={stroke} />
      <circle cx="20" cy="13" r="1.3" fill={stroke} />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-primary">host</span>easy
    </span>
  );
}
