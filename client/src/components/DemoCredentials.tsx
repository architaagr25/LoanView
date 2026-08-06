"use client";

import { useState } from "react";
import { ChevronDown, KeyRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { ROLE_LABEL } from "@/lib/constants";
import type { UserRole } from "@/lib/types";

const DEMO_PASSWORD = "Loanview@123";

const DEMO_ACCOUNTS: Array<{ role: UserRole; email: string; description: string }> = [
  { role: "borrower", email: "borrower@loanview.com", description: "Apply for a loan" },
  { role: "admin", email: "admin@loanview.com", description: "All four modules" },
  { role: "sales", email: "sales@loanview.com", description: "Lead tracking" },
  { role: "sanction", email: "sanction@loanview.com", description: "Approve or reject" },
  { role: "disbursement", email: "disbursement@loanview.com", description: "Release funds" },
  { role: "collection", email: "collection@loanview.com", description: "Record repayments" },
];

const ROLE_TONE: Record<UserRole, string> = {
  borrower: "bg-brand-50 text-brand-700 ring-brand-200",
  admin: "bg-violet-50 text-violet-700 ring-violet-200",
  sales: "bg-sky-50 text-sky-700 ring-sky-200",
  sanction: "bg-amber-50 text-amber-700 ring-amber-200",
  disbursement: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  collection: "bg-rose-50 text-rose-700 ring-rose-200",
};

/**
 * Prefilled accounts for whoever is reviewing this system.
 *
 * These are seeded test accounts holding no real data, and their credentials
 * accompany the submission anyway, so listing them costs nothing and saves
 * typing six sets of credentials to check six roles. A real deployment would
 * not carry this.
 */
export function DemoCredentials({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/70 shadow-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <KeyRound className="size-4" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-medium text-slate-800">Demo accounts</span>
          <span className="block text-xs text-slate-500">One click to sign in as any role</span>
        </span>
        <ChevronDown
          className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 p-2 animate-slide-down">
          <ul className="space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => onSelect(account.email, DEMO_PASSWORD)}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-brand-50/60"
                >
                  <span
                    className={cn(
                      "w-24 shrink-0 rounded-md px-2 py-1 text-center text-[0.7rem] font-semibold ring-1 ring-inset",
                      ROLE_TONE[account.role],
                    )}
                  >
                    {ROLE_LABEL[account.role]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-700">{account.email}</span>
                    <span className="block text-xs text-slate-400">{account.description}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="px-2.5 pt-2 pb-1 text-xs text-slate-400">
            Password for all accounts:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
              {DEMO_PASSWORD}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
