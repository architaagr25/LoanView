"use client";

import { RequireAuth } from "./RequireAuth";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/Button";
import { Card, CardBody } from "./ui/Card";
import { MODULE_DESCRIPTION, MODULE_LABEL, ROLE_LABEL } from "@/lib/constants";
import type { DashboardModule } from "@/lib/types";

/**
 * Temporary content for a dashboard module, replaced by the real queue in
 * phase 8. It exists so every role has somewhere real to land — a route that
 * signs someone in and then shows them a 404 has no way out, because returning
 * to the start sends them straight back to the same missing page.
 */
export function ModulePlaceholder({ module }: { module: DashboardModule }) {
  return (
    <RequireAuth roles={["admin", module]}>
      <Content module={module} />
    </RequireAuth>
  );
}

function Content({ module }: { module: DashboardModule }) {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold text-slate-900">{MODULE_LABEL[module]}</h1>
          <p className="mt-1 text-sm text-slate-500">{MODULE_DESCRIPTION[module]}</p>
          <p className="mt-4 text-sm text-slate-700">
            Signed in as {user?.name} — {user ? ROLE_LABEL[user.role] : ""}
          </p>
          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
