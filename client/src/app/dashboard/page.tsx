"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { MODULE_LABEL, ROLE_LABEL } from "@/lib/constants";

/** Placeholder — the operations dashboard replaces this in phase 8. */
export default function DashboardPage() {
  return (
    <RequireAuth roles={["admin", "sales", "sanction", "disbursement", "collection"]}>
      <DashboardContent />
    </RequireAuth>
  );
}

function DashboardContent() {
  const { user, modules, logout } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold text-slate-900">Operations dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.name} — {user ? ROLE_LABEL[user.role] : ""}
          </p>
          <p className="mt-3 text-sm text-slate-700">
            Modules available: {modules.map((module) => MODULE_LABEL[module]).join(", ") || "none"}
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
