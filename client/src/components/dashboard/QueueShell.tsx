import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { SkeletonRows } from "@/components/ui/Spinner";

interface QueueShellProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  empty: ReactNode;
  children: ReactNode;
}

/**
 * The three states every queue can be in, handled in one place.
 *
 * Without this each module would repeat the same loading / error / empty
 * branching, and they would drift — one showing a spinner where another shows
 * nothing, one swallowing an error the others report.
 */
export function QueueShell({ loading, error, isEmpty, empty, children }: QueueShellProps) {
  if (error) {
    return (
      <Alert tone="error" title="Could not load this queue">
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Card>
        <SkeletonRows rows={4} />
      </Card>
    );
  }

  return <Card>{isEmpty ? empty : children}</Card>;
}
