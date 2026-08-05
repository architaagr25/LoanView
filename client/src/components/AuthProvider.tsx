"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, apiBaseUrl } from "@/lib/api";
import { clearToken, readToken, writeToken } from "@/lib/session";
import type { AuthPayload, DashboardModule, User } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  /** Modules this user may open, as decided by the server. */
  modules: DashboardModule[];
  login: (email: string, password: string) => Promise<AuthPayload>;
  signup: (name: string, email: string, password: string) => Promise<AuthPayload>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<DashboardModule[]>([]);

  const applySession = useCallback((payload: AuthPayload) => {
    writeToken(payload.token);
    setUser(payload.user);
    setModules(payload.modules);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setModules([]);
    setStatus("anonymous");
  }, []);

  // Restore a session on load. The stored token is not trusted on its own —
  // it is sent to the server, and the identity comes back from there. That way
  // a revoked account or a changed role takes effect immediately rather than
  // whenever the token happens to expire.
  useEffect(() => {
    let cancelled = false;

    // Written as one asynchronous operation with a single exit point. The
    // status starts as "loading" for both the server render and the first
    // client render, so hydration matches; it only settles once the token has
    // actually been checked.
    const restoreSession = async (): Promise<void> => {
      if (!readToken()) {
        if (!cancelled) setStatus("anonymous");
        return;
      }

      try {
        const data = await api.get<{ user: User; modules: DashboardModule[] }>("/auth/me");
        if (cancelled) return;

        setUser(data.user);
        setModules(data.modules);
        setStatus("authenticated");
      } catch (error: unknown) {
        if (cancelled) return;

        // A rejected token is stale, so discard it. Any other failure — the
        // server being unreachable, for instance — must not silently sign
        // someone out, because their token may well still be valid.
        if (error instanceof ApiError && error.isUnauthenticated) {
          clearToken();
        }

        setUser(null);
        setModules([]);
        setStatus("anonymous");
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Free hosting suspends the API after a period without traffic, and the next
  // request pays roughly a minute to wake it. Pinging on load overlaps that
  // wait with the user reading the page, instead of it landing on their first
  // click. Failure is irrelevant here — the request exists for its side effect.
  useEffect(() => {
    void fetch(`${apiBaseUrl}/health`).catch(() => undefined);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await api.post<AuthPayload>("/auth/login", { email, password });
      applySession(payload);
      return payload;
    },
    [applySession],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const payload = await api.post<AuthPayload>("/auth/signup", { name, email, password });
      applySession(payload);
      return payload;
    },
    [applySession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, modules, login, signup, logout }),
    [status, user, modules, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
