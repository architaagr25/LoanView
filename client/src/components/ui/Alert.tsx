import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "error";

const TONES: Record<Tone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, className }: AlertProps) {
  return (
    <div
      // Errors are announced when they appear; the rest are read in document
      // order. "assertive" would interrupt whatever a screen reader is saying,
      // which is right for a failure and rude for a confirmation.
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", TONES[tone], className)}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={cn(title && "mt-1")}>{children}</div>}
    </div>
  );
}

/** Bulleted list of reasons, as returned by a failed eligibility check. */
export function ReasonList({ reasons }: { reasons: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {reasons.map((reason) => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  );
}
