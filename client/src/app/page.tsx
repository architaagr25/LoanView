"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LoadingBlock } from "@/components/ui/Spinner";
import { homePathForRole, ROUTES } from "@/lib/routes";

/**
 * Entry point. Sends each visitor to the right place rather than showing a
 * marketing page nobody in this system needs: a signed-in user goes to their
 * own area, everyone else to sign-in.
 */
export default function HomePage() {
  const { status, user, modules } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    router.replace(user ? homePathForRole(user.role, modules) : ROUTES.login);
  }, [status, user, modules, router]);

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <LoadingBlock label="Loading LoanView" />
    </main>
  );
}
