import { Check } from "lucide-react";
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
    <nav aria-label="Application progress">
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isDone = completed.includes(step.id);
          const isCurrent = step.id === current;
          const canSelect = Boolean(onSelect) && isDone && !isCurrent;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={!canSelect}
                onClick={canSelect ? () => onSelect?.(step.id) : undefined}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group flex items-center gap-2.5 rounded-xl py-1.5 pr-3 pl-1.5 transition-colors",
                  canSelect ? "hover:bg-slate-100" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isCurrent &&
                      "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand ring-4 ring-brand-100",
                    isDone && !isCurrent && "bg-emerald-500 text-white",
                    !isDone && !isCurrent && "bg-white text-slate-400 ring-1 ring-slate-200",
                  )}
                >
                  {isDone && !isCurrent ? (
                    <Check className="size-4" aria-hidden="true" strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium whitespace-nowrap transition-colors sm:inline",
                    isCurrent ? "text-slate-900" : isDone ? "text-slate-600" : "text-slate-400",
                  )}
                >
                  {step.title}
                </span>
              </button>

              {index < steps.length - 1 && (
                // The connector fills in as steps complete, so progress reads as
                // one continuous line rather than three separate markers.
                <span className="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className={cn(
                      "block h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out",
                      isDone ? "w-full" : "w-0",
                    )}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
