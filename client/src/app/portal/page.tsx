"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

/** Placeholder — the application wizard replaces this in step 7.2. */
export default function PortalPage() {
  return (
    <RequireAuth roles={["borrower"]}>
      <PortalContent />
    </RequireAuth>
  );
}

function PortalContent() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <CardBody>
          <h1 className="text-xl font-semibold text-slate-900">Borrower portal</h1>
          <p className="mt-1 text-sm text-slate-500">
            Signed in as {user?.name} ({user?.email})
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
