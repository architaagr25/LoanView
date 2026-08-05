import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LoanView",
    template: "%s · LoanView",
  },
  description:
    "Apply for a loan and track it through review, disbursement and repayment.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full font-sans">
        {/* Wraps the whole tree so the session is restored once, and every
            screen reads the same identity rather than fetching its own. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
