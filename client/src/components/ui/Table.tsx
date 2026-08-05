import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Table shell with horizontal scrolling built in.
 *
 * The queues carry enough columns to overflow a phone, and a table that
 * stretches the page is worse than one that scrolls inside its own container:
 * it pushes every other element sideways too.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-200 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TH({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}

export function TD({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-slate-700", className)}>{children}</td>;
}

export function TR({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-slate-50/70", className)}>{children}</tr>;
}
