"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Loan, Profile } from "@/lib/types";

const ACTIVE_STATUSES = ["APPLIED", "SANCTIONED", "DISBURSED"] as const;

export interface ApplicationState {
  profile: Profile | null;
  loans: Loan[];
  /** The loan currently in play, if any. Blocks re-applying and editing. */
  activeLoan: Loan | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * The borrower's whole situation in one place: their details, their documents
 * and their loans.
 *
 * Every screen in the portal needs the same three facts to decide what to show,
 * so they are fetched once here rather than each screen assembling its own
 * partial view and reaching a different conclusion.
 */
export function useApplication(): ApplicationState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped to ask for fresh data. The effect owns the request, so there is one
  // place that fetches and one place that cleans up, rather than a callback
  // that can also be invoked from anywhere with no way to cancel it.
  const [refreshCount, setRefreshCount] = useState(0);

  const reload = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        // Requested together rather than in sequence — neither depends on the
        // other, and waiting for one before starting the other doubles the
        // delay the borrower sees on a cold backend.
        const [profileResult, loanResult] = await Promise.all([
          api.get<{ profile: Profile | null }>("/borrower/profile"),
          api.get<{ loans: Loan[] }>("/borrower/loans"),
        ]);

        // Guarded because a borrower can navigate away mid-request; updating
        // state after that warns in development and leaks in principle.
        if (cancelled) return;

        setProfile(profileResult.profile);
        setLoans(loanResult.loans);
        setError(null);
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Could not load your application");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshCount]);

  const activeLoan =
    loans.find((loan) => (ACTIVE_STATUSES as readonly string[]).includes(loan.status)) ?? null;

  return { profile, loans, activeLoan, loading, error, reload };
}
