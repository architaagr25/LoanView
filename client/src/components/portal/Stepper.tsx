import { cn } from "@/lib/cn";

export interface Step {
  id: number;
  title: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  /** Steps already satisfied, which may be revisited. */
  completed: number[];
  onSelect?: (step: number) => void;
}

/**
 * Progress through the application.
 *
 * A completed step stays clickable so details can be corrected without
 * restarting; a step not yet reached does not, because it depends on data that
 * has not been provided.
 */
export function Stepper({ steps, current, completed, onSelect }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {steps.map((step, index) => {
        const isDone = completed.includes(step.id);
        const isCurrent = step.id === current;
        const canSelect = Boolean(onSelect) && isDone && !isCurrent;

        return (
          <li key={step.id} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!canSelect}
              onClick={canSelect ? () => onSelect?.(step.id) : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors",
                canSelect && "hover:bg-slate-100",
                !canSelect && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isCurrent
                    ? "bg-brand-600 text-white"
                    : isDone
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-500",
                )}
                aria-hidden="true"
              >
                {isDone && !isCurrent ? "✓" : step.id}
              </span>
              <span
                className={cn(
                  "font-medium whitespace-nowrap",
                  isCurrent ? "text-slate-900" : isDone ? "text-slate-700" : "text-slate-400",
                )}
              >
                {step.title}
              </span>
              {isCurrent && <span className="sr-only">(current step)</span>}
            </button>

            {index < steps.length - 1 && (
              <span className="hidden h-px w-6 bg-slate-200 sm:block" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
