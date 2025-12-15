// front/src/hooks/useAuth.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { User } from "../shared/types";
import type { Role } from "../shared/prisma-enums";
import {
  getMe,
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
} from "../lib/api/auth";

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: (force?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const getToken = () => localStorage.getItem("access_token");

// /auth/me のレスポンスをアプリ内部の User に正規化
function normalizeMe(raw: any): User | null {
  if (!raw) return null;

  // axios などで { data: {...} } が来る可能性も見る
  const src = raw.data ?? raw;

  const id = String(src.id ?? src.sub ?? '');
  if (!id) return null;

  const beRole: string =
    (src.role as string | undefined) ??
    (src.creatorId ? 'creator' : 'user');

  let role: Role;
  switch (beRole) {
    case 'user':
    case 'fan':
      role = 'fan';
      break;
    case 'creator':
      role = 'creator';
      break;
    case 'admin':
      role = 'admin';
      break;
    case 'sub_admin':
      role = 'sub_admin';
      break;
    default:
      role = 'fan';
      break;
  }

  // ← ここを追加（creatorId を number | null にそろえる）
  let creatorId: number | null = null;
  const rawCreatorId = (src as any).creatorId;

  if (typeof rawCreatorId === 'number') {
    creatorId = rawCreatorId;
  } else if (typeof rawCreatorId === 'string' && rawCreatorId !== '') {
    const n = Number(rawCreatorId);
    creatorId = Number.isFinite(n) ? n : null;
  }  

  return {
    id,
    email: (src.email as string) ?? '',
    role,
    creatorId, // number | null
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const restore = useCallback(async (force = false) => {
    setReady(false);
    try {
      const hasToken = !!getToken();
      if (!hasToken && !force) {
        setUser(null);
        return;
      }

      const me = await getMe(); // ← auth.ts 経由
      setUser(normalizeMe(me));
    } catch {
      // /auth/me が 401 のときなど
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  // アプリ起動時に1回だけ
  useEffect(() => {
    restore();
  }, [restore]);

  const login = async (email: string, password: string) => {
    await apiLogin({ email, password }); // token 保存は auth.ts がやる
    await restore(true);
  };

  const signup = async (email: string, password: string) => {
    await apiSignup({ email, password, role: "fan" });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    ready,
    login,
    signup,
    logout,
    restore,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
