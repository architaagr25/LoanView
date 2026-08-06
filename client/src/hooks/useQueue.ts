"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface QueueState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Refetches. Called after an action changes what belongs in the queue. */
  reload: () => void;
}

/**
 * Fetches a dashboard queue.
 *
 * All four modules do the same thing — read a filtered list, act on a row, then
 * read it again — so the fetching, error handling and refresh live here once
 * rather than being written out four times with four slightly different
 * loading states.
 *
 * The effect owns the request and reload bumps a counter that re-runs it, which
 * keeps cancellation in one place: a queue that is navigated away from
 * mid-request does not write state after unmount.
 */
export function useQueue<T>(path: string): QueueState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const reload = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const result = await api.get<T>(path);
        if (cancelled) return;
        setData(result);
        setError(null);
      } catch (caught) {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Could not load this queue");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [path, refreshCount]);

  return { data, loading, error, reload };
}
