import type { Metadata } from "next";

// The page itself is a client component and cannot export metadata, so the
// browser tab title is set from a layout wrapped around it.
export const metadata: Metadata = { title: "Collection" };

export default function CollectionLayout({ children }: LayoutProps<"/dashboard/collection">) {
  return children;
}
