import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LOAN_STATUS_LABEL } from "@/lib/constants";
import type { LeadStage, LoanStatus } from "@/lib/types";

type Tone = "neutral" | "info" | "warning" | "success" | "danger" | "brand";

const TONES: Record<Tone, { chip: string; dot: string }> = {
  neutral: { chip: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  info: { chip: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  warning: { chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  success: { chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  danger: { chip: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  brand: { chip: "bg-brand-50 text-brand-700 ring-brand-200", dot: "bg-brand-500" },
};

interface BadgeProps {
  tone?: Tone;
  /** Adds a coloured dot, and animates it when the state is still moving. */
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
}

export function Badge({ tone = "neutral", dot = false, pulse = false, children }: BadgeProps) {
  const { chip, dot: dotColour } = TONES[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        "ring-1 ring-inset whitespace-nowrap",
        chip,
      )}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", dotColour, pulse && "animate-pulse-ring")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

/**
 * Colour carries meaning, so it is mapped in one place: amber means waiting on
 * someone, sky means approved but not yet acted on, emerald means money has
 * moved, slate means settled and closed, rose means declined.
 *
 * The two statuses that are waiting on a person get a pulsing dot — the queues
 * are the point of the dashboard, and a moving marker says "this needs you"
 * without adding a word of text.
 */
const STATUS_STYLE: Record<LoanStatus, { tone: Tone; pulse: boolean }> = {
  APPLIED: { tone: "warning", pulse: true },
  SANCTIONED: { tone: "info", pulse: true },
  DISBURSED: { tone: "success", pulse: false },
  CLOSED: { tone: "neutral", pulse: false },
  REJECTED: { tone: "danger", pulse: false },
};

export function StatusBadge({ status }: { status: LoanStatus }) {
  const { tone, pulse } = STATUS_STYLE[status];

  return (
    <Badge tone={tone} dot pulse={pulse}>
      {LOAN_STATUS_LABEL[status]}
    </Badge>
  );
}

const STAGE_LABEL: Record<LeadStage, string> = {
  REGISTERED: "Registered",
  DETAILS_SUBMITTED: "Details submitted",
  DOCUMENTS_UPLOADED: "Documents uploaded",
};

const STAGE_TONE: Record<LeadStage, Tone> = {
  REGISTERED: "neutral",
  DETAILS_SUBMITTED: "info",
  DOCUMENTS_UPLOADED: "success",
};

export function StageBadge({ stage }: { stage: LeadStage }) {
  return (
    <Badge tone={STAGE_TONE[stage]} dot>
      {STAGE_LABEL[stage]}
    </Badge>
  );
}
