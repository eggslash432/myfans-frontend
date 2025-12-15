// front/src/hooks/useAuth.tsx

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { Me } from "../shared/types";
import type { Role } from "../shared/prisma-enums";
import { getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from "../lib/api/auth";

type AuthContextType = {
  user: Me | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: (force?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const getToken = () => localStorage.getItem("access_token");

// /auth/me を Me に正規化（最小）
function normalizeMe(raw: any): Me | null {
  if (!raw) return null;
  const src = raw.data ?? raw;

  const id = String(src.id ?? "");
  if (!id) return null;

  const role = (src.role as Role | undefined) ?? "fan";

  return {
    id,
    email: (src.email as string) ?? "",
    role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  const restore = useCallback(async (force = false) => {
    setReady(false);
    try {
      const hasToken = !!getToken();
      if (!hasToken && !force) {
        setUser(null);
        return;
      }
      const me = await getMe();
      setUser(normalizeMe(me));
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    restore();
  }, [restore]);

  const login = async (email: string, password: string) => {
    await apiLogin({ email, password });
    await restore(true);
  };

  const signup = async (email: string, password: string) => {
    await apiSignup({ email, password, role: "fan" });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, restore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
