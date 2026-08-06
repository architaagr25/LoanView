import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Shell for the signed-out screens.
 *
 * A route group, so the folder name never appears in the URL — these stay at
 * /login and /signup while sharing one layout.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Loan<span className="text-brand-600">View</span>
        </Link>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 pb-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
