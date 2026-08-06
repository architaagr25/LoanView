import type { Metadata } from "next";

// The page itself is a client component and cannot export metadata, so the
// browser tab title is set from a layout wrapped around it.
export const metadata: Metadata = { title: "Create your account" };

export default function SignupLayout({ children }: LayoutProps<"/signup">) {
  return children;
}
