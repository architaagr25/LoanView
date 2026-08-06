import type { Metadata } from "next";

// The page itself is a client component and cannot export metadata, so the
// browser tab title is set from a layout wrapped around it.
export const metadata: Metadata = { title: "Sign in" };

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return children;
}
