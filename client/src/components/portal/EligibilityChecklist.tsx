import { Check, Minus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { RulePreview } from "@/lib/eligibility";

const MARKS = {
  pending: { Icon: Minus, chip: "bg-slate-100 text-slate-400", text: "text-slate-500" },
  passed: { Icon: Check, chip: "bg-emerald-500 text-white", text: "text-slate-700" },
  failed: { Icon: X, chip: "bg-rose-500 text-white", text: "text-rose-700" },
} as const;

/**
 * Live view of the eligibility rules as the form is filled in.
 *
 * Showing the criteria up front and marking each one as it is satisfied means
 * an applicant who will be declined finds out while they can still change an
 * answer, rather than completing every field and then being refused with no
 * indication of which one caused it.
 */
export function EligibilityChecklist({ rules }: { rules: RulePreview[] }) {
  const passed = rules.filter((rule) => rule.state === "passed").length;
  const failed = rules.some((rule) => rule.state === "failed");

  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-card">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Eligibility</h3>
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              failed ? "text-rose-600" : passed === rules.length ? "text-emerald-600" : "text-slate-400",
            )}
          >
            {passed} of {rules.length}
          </span>
        </div>

        {/* A single bar reading the same thing as the list below it. Progress is
            easier to judge from a filled proportion than from counting ticks. */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              failed ? "bg-rose-400" : "bg-emerald-500",
            )}
            style={{ width: `${(passed / rules.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3 px-5 py-4">
        {rules.map((rule) => {
          const { Icon, chip, text } = MARKS[rule.state];

          return (
            <li key={rule.code} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
                  chip,
                )}
                aria-hidden="true"
              >
                <Icon className="size-3" strokeWidth={3} />
              </span>
              <span className={cn("text-sm leading-snug", text)}>
                {rule.label}
                {rule.message && <span className="text-slate-400"> — {rule.message}</span>}
                {/* State is carried by icon and colour for sighted users; this
                    is how it reaches everyone else. */}
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
