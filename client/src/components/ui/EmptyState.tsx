import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Shown when a queue or list has nothing in it.
 *
 * Worth having as its own component: a blank area reads as a page that failed
 * to load, whereas a stated "nothing here" reads as a queue that is clear —
 * which, for a dashboard module, is usually good news rather than a fault.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
