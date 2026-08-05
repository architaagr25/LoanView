import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LOAN_STATUS_LABEL } from "@/lib/constants";
import type { LeadStage, LoanStatus } from "@/lib/types";

type Tone = "neutral" | "info" | "warning" | "success" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Colour carries meaning here, so it is mapped in one place: amber means
 * waiting on someone, sky means approved but not yet acted on, emerald means
 * money has moved or the loan is settled, rose means declined.
 */
const STATUS_TONE: Record<LoanStatus, Tone> = {
  APPLIED: "warning",
  SANCTIONED: "info",
  DISBURSED: "success",
  CLOSED: "neutral",
  REJECTED: "danger",
};

export function StatusBadge({ status }: { status: LoanStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{LOAN_STATUS_LABEL[status]}</Badge>;
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
  return <Badge tone={STAGE_TONE[stage]}>{STAGE_LABEL[stage]}</Badge>;
}
