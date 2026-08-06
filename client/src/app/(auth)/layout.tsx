import Link from "next/link";
import type { ReactNode } from "react";
import { BadgeCheck, ShieldCheck, Wallet } from "lucide-react";
import { Logo } from "@/components/Logo";

const HIGHLIGHTS = [
  {
    Icon: BadgeCheck,
    title: "Decisions in seconds",
    body: "Eligibility is checked as you type, so you know where you stand before you submit.",
  },
  {
    Icon: Wallet,
    title: "Terms with no surprises",
    body: "A fixed 12% per annum, with the full repayment figure shown before you apply.",
  },
  {
    Icon: ShieldCheck,
    title: "Reviewed by real people",
    body: "Every application passes through sanction, disbursement and collection.",
  },
];

/**
 * Shell for the signed-out screens.
 *
 * A route group, so the folder name never appears in a URL — these stay at
 * /login and /signup while sharing one layout.
 *
 * The brand panel is hidden below large screens rather than stacked above the
 * form. On a phone it would push the actual task off the fold, and someone
 * signing in wants the form, not the pitch.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="relative hidden w-[46%] max-w-2xl overflow-hidden bg-brand-950 lg:flex lg:flex-col">
        {/* Two soft light sources plus a fine grid. Enough to give the panel
            depth without turning it into a poster. */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 40rem 30rem at 20% 0%, rgb(99 102 241 / 0.55), transparent), radial-gradient(ellipse 35rem 25rem at 90% 90%, rgb(6 182 212 / 0.35), transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-1 flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="w-fit">
            <Logo tone="light" />
          </Link>

          <div className="animate-rise">
            <h2 className="max-w-md text-4xl font-semibold tracking-tight text-white xl:text-[2.75rem] xl:leading-[1.1]">
              Borrowing, without the waiting room.
            </h2>
            <p className="mt-4 max-w-md text-base text-brand-200">
              Apply in three steps and follow your loan from request to final repayment.
            </p>

            <ul className="mt-10 space-y-6">
              {HIGHLIGHTS.map(({ Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-white/15">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-0.5 max-w-sm text-sm text-brand-200/80">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-brand-300/60">
            Interest calculated as simple interest at 12% per annum.
          </p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="px-6 py-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16 lg:py-12">
          <div className="w-full max-w-md animate-rise">{children}</div>
        </main>
      </div>
    </div>
  );
}
