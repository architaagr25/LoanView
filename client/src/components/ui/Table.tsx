import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Table shell with horizontal scrolling built in.
 *
 * The queues carry enough columns to overflow a phone, and a table that
 * stretches the page is worse than one scrolling inside its own container: it
 * pushes every other element sideways with it.
 *
 * The minimum width is adjustable because it is a promise about how much room
 * the columns need. A three-column list of payments does not need the same
 * floor as a seven-column queue, and claiming it does forces a scrollbar onto a
 * table that would have fitted.
 */
export function TableWrap({
  children,
  minWidth = "min-w-[44rem]",
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-left text-sm", minWidth)}>{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-500 uppercase">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-5 py-3.5 whitespace-nowrap", className)}>{children}</th>;
}

export function TD({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-5 py-4 align-middle text-slate-700", className)}>{children}</td>;
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("transition-colors hover:bg-brand-50/40", className)}>{children}</tr>
  );
}
