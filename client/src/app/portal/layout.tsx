"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";

/**
 * Shell for the borrower area.
 *
 * The role guard sits on the layout rather than on each page, so any page added
 * under /portal is protected by default. Forgetting to add a guard should
 * produce a route nobody can reach, not one anybody can.
 */
export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <RequireAuth roles={["borrower"]}>
      <div className="flex min-h-dvh flex-col">
        <PortalHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </RequireAuth>
  );
}

function PortalHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={ROUTES.portal} className="text-lg font-semibold tracking-tight text-slate-900">
          Loan<span className="text-brand-600">View</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* The name is supporting detail on a narrow screen, so it gives up
              its space first rather than wrapping the header onto two lines. */}
          <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
          <Button variant="secondary" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
