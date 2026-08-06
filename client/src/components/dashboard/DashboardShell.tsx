"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BanknoteArrowUp, LayoutGrid, LogOut, Send, Users, Wallet } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";
import { UserChip } from "@/components/UserChip";
import { cn } from "@/lib/cn";
import { MODULE_LABEL, ROLE_LABEL } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import type { DashboardModule } from "@/lib/types";

const MODULE_ICON: Record<DashboardModule, typeof Users> = {
  sales: Users,
  sanction: BanknoteArrowUp,
  disbursement: Send,
  collection: Wallet,
};

/**
 * Shell for the operations dashboard.
 *
 * The role guard sits on the layout, so every page beneath it is protected by
 * default rather than depending on each one remembering.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={["admin", "sales", "sanction", "disbursement", "collection"]}>
      <div className="flex min-h-dvh flex-col">
        <DashboardHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
          <div className="animate-rise">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
}

function DashboardHeader() {
  const { user, modules, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={ROUTES.dashboard} className="transition-opacity hover:opacity-80">
              <Logo />
            </Link>
            <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 sm:inline">
              Operations
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && <UserChip name={user.name} subtitle={ROLE_LABEL[user.role]} />}
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

        {/*
          Only the modules this account may open are listed, and the list comes
          from the server rather than being derived from the role here. An
          executive with one module sees one tab; hiding the rest is presentation
          only — the API refuses them regardless.
        */}
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Modules">
          {modules.length > 1 && (
            <NavTab
              href={ROUTES.dashboard}
              label="Overview"
              Icon={LayoutGrid}
              active={pathname === ROUTES.dashboard}
            />
          )}
          {modules.map((module) => (
            <NavTab
              key={module}
              href={ROUTES.module(module)}
              label={MODULE_LABEL[module]}
              Icon={MODULE_ICON[module]}
              active={pathname === ROUTES.module(module)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

function NavTab({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof Users;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 text-brand-700"
          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
