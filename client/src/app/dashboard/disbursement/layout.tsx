import type { Metadata } from "next";

// The page itself is a client component and cannot export metadata, so the
// browser tab title is set from a layout wrapped around it.
export const metadata: Metadata = { title: "Disbursement" };

export default function DisbursementLayout({ children }: LayoutProps<"/dashboard/disbursement">) {
  return children;
}
