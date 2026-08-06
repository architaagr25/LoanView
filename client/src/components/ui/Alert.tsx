import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "error";

const TONES: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  info: { box: "bg-sky-50 ring-sky-200 text-sky-900", icon: "text-sky-500", Icon: Info },
  success: {
    box: "bg-emerald-50 ring-emerald-200 text-emerald-900",
    icon: "text-emerald-500",
    Icon: CheckCircle2,
  },
  warning: {
    box: "bg-amber-50 ring-amber-200 text-amber-900",
    icon: "text-amber-500",
    Icon: TriangleAlert,
  },
  error: { box: "bg-rose-50 ring-rose-200 text-rose-900", icon: "text-rose-500", Icon: AlertCircle },
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { box, icon, Icon } = TONES[tone];

  return (
    <div
      // Errors are announced when they appear; the rest are read in document
      // order. "assertive" interrupts whatever a screen reader is saying, which
      // is right for a failure and rude for a confirmation.
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl px-4 py-3.5 text-sm ring-1 ring-inset animate-slide-down",
        box,
        className,
      )}
    >
      {/* The icon repeats what the colour says, so the meaning survives for
          anyone who cannot distinguish the two palettes. */}
      <Icon className={cn("mt-px size-5 shrink-0", icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-1")}>{children}</div>}
      </div>
    </div>
  );
}

/** Bulleted list of reasons, as returned by a failed eligibility check. */
export function ReasonList({ reasons }: { reasons: string[] }) {
  return (
    <ul className="space-y-1.5">
      {reasons.map((reason) => (
        <li key={reason} className="flex gap-2">
          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current opacity-50" aria-hidden="true" />
          <span>{reason}</span>
        </li>
      ))}
    </ul>
  );
}
