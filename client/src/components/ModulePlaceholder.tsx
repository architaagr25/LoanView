"use client";

import { Construction } from "lucide-react";
import { RequireAuth } from "./RequireAuth";
import { Card } from "./ui/Card";
import { EmptyState, PageHeader } from "./ui/EmptyState";
import { MODULE_DESCRIPTION, MODULE_LABEL } from "@/lib/constants";
import type { DashboardModule } from "@/lib/types";

/**
 * Temporary content for a dashboard module, replaced by the real queue in the
 * next phase. It exists so every role has somewhere real to land — a route that
 * signs someone in and then shows a 404 has no way out, because returning to
 * the start sends them straight back to the same missing page.
 */
export function ModulePlaceholder({ module }: { module: DashboardModule }) {
  return (
    <RequireAuth roles={["admin", module]}>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Operations"
          title={MODULE_LABEL[module]}
          description={MODULE_DESCRIPTION[module]}
        />
        <Card>
          <EmptyState
            title="This module is being built"
            description="The queue and its actions arrive in the next phase of work."
            icon={<Construction className="size-6" aria-hidden="true" />}
          />
        </Card>
      </div>
    </RequireAuth>
  );
}
