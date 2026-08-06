import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

// Server layout, client shell — see the borrower portal's layout for why.
export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · LoanView" } };

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
