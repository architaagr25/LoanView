import { cn } from "@/lib/cn";

/**
 * Wordmark with a mark. Drawn as inline SVG rather than loaded as an image so
 * it inherits colour from its surroundings and works on both the light shell
 * and the dark brand panel without a second asset.
 */
export function Logo({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand">
        <svg viewBox="0 0 24 24" fill="none" className="size-4.5 text-white" aria-hidden="true">
          {/* An upward line over a baseline — growth, without resorting to a
              literal rupee sign or a bank building. */}
          <path
            d="M4 17.5 9.5 11l4 4L20 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 21h16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          tone === "dark" ? "text-slate-900" : "text-white",
        )}
      >
        Loan
        <span className={tone === "dark" ? "text-brand-600" : "text-brand-300"}>View</span>
      </span>
    </span>
  );
}
