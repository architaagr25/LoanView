import Link from "next/link";

/**
 * Shown for any URL that does not match a route.
 *
 * The default is a bare message with no way out, which strands anyone who
 * mistypes a URL or follows a stale link — they have to edit the address bar to
 * escape. A link back to the start costs nothing and removes the dead end.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The link may be out of date, or the address may have been mistyped.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to LoanView
      </Link>
    </main>
  );
}
