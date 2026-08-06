"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import type { UserRole } from "@/lib/types";

const DEMO_PASSWORD = "Loanview@123";

const DEMO_ACCOUNTS: Array<{ role: UserRole; email: string; description: string }> = [
  { role: "admin", email: "admin@loanview.com", description: "All four modules" },
  { role: "sales", email: "sales@loanview.com", description: "Lead tracking" },
  { role: "sanction", email: "sanction@loanview.com", description: "Approve or reject" },
  { role: "disbursement", email: "disbursement@loanview.com", description: "Release funds" },
  { role: "collection", email: "collection@loanview.com", description: "Record repayments" },
  { role: "borrower", email: "borrower@loanview.com", description: "Borrower portal" },
];

/**
 * Prefilled accounts for whoever is reviewing this system.
 *
 * These are seeded, publicly documented test accounts holding no real data, so
 * listing them costs nothing and saves the reviewer typing six sets of
 * credentials to check six roles. A real deployment would not carry this.
 */
export function DemoCredentials({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-slate-700">Demo accounts</span>
        <span className="text-xs text-slate-500">{open ? "Hide" : "Show"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-500">
            Every account uses the password{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 font-mono">{DEMO_PASSWORD}</code>
          </p>

          <ul className="mt-3 space-y-1.5">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-slate-700">{account.email}</p>
                  <p className="text-xs text-slate-400">{account.description}</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelect(account.email, DEMO_PASSWORD)}
                >
                  Use
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
