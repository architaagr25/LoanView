"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { LoadingBlock } from "./ui/Spinner";
import { homePathForRole, ROUTES } from "@/lib/routes";
import type { UserRole } from "@/lib/types";

interface RequireAuthProps {
  /** Roles permitted here. Omit to allow any signed-in user. */
  roles?: UserRole[];
  children: ReactNode;
}

/**
 * Client-side route guard.
 *
 * This is a convenience, not a security boundary. It keeps someone from
 * reaching a screen whose every request would be refused anyway. The decision
 * that matters is made by the API, which authorises each request independently
 * and has no reason to trust this component ran at all.
 *
 * It has to be client-side: the session token lives in localStorage, which the
 * server cannot read, so a server-side check would see every visitor as
 * anonymous.
 */
export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { status, user, modules } = useAuth();
  const router = useRouter();

  const allowed = !roles || (user ? roles.includes(user.role) : false);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "anonymous") {
      router.replace(ROUTES.login);
      return;
    }

    // Signed in but in the wrong place — send them where they do belong rather
    // than leaving them on a dead end.
    if (user && !allowed) {
      router.replace(homePathForRole(user.role, modules));
    }
  }, [status, user, allowed, modules, router]);

  if (status === "loading") {
    return <LoadingBlock label="Checking your session" />;
  }

  // Render nothing while the redirect above is in flight, so a protected screen
  // never flashes on the way past.
  if (status === "anonymous" || !user || !allowed) {
    return <LoadingBlock label="Redirecting" />;
  }

  return <>{children}</>;
}
