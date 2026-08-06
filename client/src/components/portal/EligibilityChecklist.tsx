import { cn } from "@/lib/cn";
import type { RulePreview } from "@/lib/eligibility";

const MARKS: Record<RulePreview["state"], { symbol: string; classes: string }> = {
  pending: { symbol: "•", classes: "bg-slate-100 text-slate-400" },
  passed: { symbol: "✓", classes: "bg-emerald-100 text-emerald-700" },
  failed: { symbol: "✕", classes: "bg-rose-100 text-rose-700" },
};

/**
 * Live view of the eligibility rules as the form is filled in.
 *
 * Showing the criteria up front, and marking each one as it is satisfied, means
 * an applicant who will be declined finds out while they can still correct
 * something — rather than filling in every field and then being refused with no
 * indication of which answer caused it.
 */
export function EligibilityChecklist({ rules }: { rules: RulePreview[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Eligibility criteria</h3>
      <p className="mt-0.5 text-xs text-slate-500">All four must be met to apply.</p>

      <ul className="mt-3 space-y-2.5">
        {rules.map((rule) => {
          const mark = MARKS[rule.state];

          return (
            <li key={rule.code} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-px flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  mark.classes,
                )}
                aria-hidden="true"
              >
                {mark.symbol}
              </span>
              <span
                className={cn(
                  "text-sm",
                  rule.state === "failed"
                    ? "text-rose-700"
                    : rule.state === "passed"
                      ? "text-slate-700"
                      : "text-slate-500",
                )}
              >
                {rule.label}
                {rule.message && <span className="text-slate-400"> — {rule.message}</span>}
                {/* State is conveyed by symbol and colour for sighted users;
                    this is how it reaches everyone else. */}
                <span className="sr-only">
                  {rule.state === "passed"
                    ? " (met)"
                    : rule.state === "failed"
                      ? " (not met)"
                      : " (not yet checked)"}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
