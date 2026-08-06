"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";
import { UserChip } from "@/components/UserChip";
import { ROUTES } from "@/lib/routes";

/**
 * Shell for the borrower area.
 *
 * The role guard sits on the layout rather than on each page, so any page added
 * under /portal is protected by default. Forgetting a guard should produce a
 * route nobody can reach, not one anybody can.
 */
export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <RequireAuth roles={["borrower"]}>
      <div className="flex min-h-dvh flex-col">
        <PortalHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
          <div className="animate-rise">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}

function PortalHeader() {
  const { user, logout } = useAuth();

  return (
    // Sticky and translucent: the header stays available while scrolling a long
    // loan history, without sitting as an opaque bar over the content.
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={ROUTES.portal} className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && <UserChip name={user.name} subtitle="Borrower" />}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
