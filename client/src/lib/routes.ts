import type { DashboardModule, UserRole } from "./types";

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  portal: "/portal",
  apply: "/portal/apply",
  dashboard: "/dashboard",
  module: (module: DashboardModule) => `/dashboard/${module}`,
} as const;

/**
 * Where someone belongs after signing in.
 *
 * A borrower goes to their own portal; an executive goes straight to the one
 * module they can use, so the common case is a single click rather than a
 * landing page with one link on it. An administrator sees the overview,
 * because for them there is a genuine choice to make.
 */
export function homePathForRole(role: UserRole, modules: DashboardModule[]): string {
  if (role === "borrower") return ROUTES.portal;
  if (role === "admin") return ROUTES.dashboard;

  const [only] = modules;
  return only ? ROUTES.module(only) : ROUTES.dashboard;
}
