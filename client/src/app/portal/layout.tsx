import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/PortalShell";

// The shell reads the signed-in user and so has to run in the browser, but a
// client component cannot export metadata. Keeping the layout on the server and
// the shell beside it gives the borrower area both a tab title and its guard.
export const metadata: Metadata = { title: { default: "Your loans", template: "%s · LoanView" } };

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return <PortalShell>{children}</PortalShell>;
}
