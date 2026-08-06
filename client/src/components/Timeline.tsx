import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { LOAN_STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { LoanStatus, StatusHistoryEntry } from "@/lib/types";

const DOT_TONE: Record<LoanStatus, string> = {
  APPLIED: "bg-amber-500",
  SANCTIONED: "bg-sky-500",
  DISBURSED: "bg-emerald-500",
  CLOSED: "bg-slate-400",
  REJECTED: "bg-rose-500",
};

/**
 * The loan's history, newest last.
 *
 * Rendered from the audit trail stored on the loan rather than inferred from
 * its current status, so it shows what actually happened and when — including
 * an entry the current status alone could not tell you about, such as the
 * reason a rejection was given.
 */
export function Timeline({ entries }: { entries: StatusHistoryEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-6">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;

        return (
          <li key={`${entry.status}-${entry.changedAt}`} className="relative flex gap-4">
            {/* The connector is drawn per item rather than as one line behind
                the list, so it stops cleanly at the final entry instead of
                trailing past it. */}
            {!isLast && (
              <span
                className="absolute top-7 left-[0.6875rem] h-full w-px bg-slate-200"
                aria-hidden="true"
              />
            )}

            <span
              className={cn(
                "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                DOT_TONE[entry.status],
              )}
              aria-hidden="true"
            >
              <Check className="size-3 text-white" strokeWidth={3} />
            </span>

            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-medium text-slate-900">
                {LOAN_STATUS_LABEL[entry.status]}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(entry.changedAt)}</p>
              {entry.note && <p className="mt-1.5 text-sm text-slate-600">{entry.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
