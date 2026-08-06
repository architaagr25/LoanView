import { cn } from "@/lib/cn";

/** First letters of the first and last words, for the avatar. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Who is signed in, shown as an avatar with a name beside it.
 *
 * The text is hidden on narrow screens and the avatar is kept: it is the part
 * that still reads at a glance, and it stops the header wrapping onto two lines
 * on a phone.
 */
export function UserChip({
  name,
  subtitle,
  className,
}: {
  name: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white ring-2 ring-white shadow-card"
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      <span className="hidden min-w-0 sm:block">
        <span className="block truncate text-sm font-medium text-slate-800">{name}</span>
        {subtitle && <span className="block truncate text-xs text-slate-500">{subtitle}</span>}
      </span>
    </span>
  );
}
