// src/hooks/useAuth.tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api'; // ← 既存の api ラッパー（api.me()/login()/signup()/logout()）を想定

// ---- types ----
type Role = 'fan' | 'creator' | 'admin';
export type User = { id: string; email: string | null; role: Role; creatorId?: number | null };

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: 'fan' | 'creator') => Promise<void>;
  logout: () => Promise<void>;
  restore: (force?: boolean) => Promise<void>;
};

// ---- helpers ----
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const getToken = () => localStorage.getItem('access_token');

// /auth/me の形をアプリ内部の User に正規化
function normalizeMe(raw: any): User | null {
  if (!raw) return null;
  const id = String(raw.id ?? raw.sub ?? '');
  if (!id) return null;

  // 役割の表記ゆれを吸収（user→fan）。creatorId があっても role は API の値を優先。
  const beRole: string =
    (raw.role as string | undefined) ??
    (raw.creatorId ? 'creator' : 'user');

  const role: Role =
    beRole === 'user' ? 'fan'
    : beRole === 'creator' ? 'creator'
    : beRole === 'admin' ? 'admin'
    : 'fan';

  return {
    id,
    email: (raw.email as string | undefined) ?? null,
    role,
    creatorId: (raw.creatorId as number | undefined) ?? null,
  };
}

// ---- provider & hook ----
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const restore = useCallback(async (force = false) => {
    try {
      const hasToken = !!getToken();
      if (!hasToken && !force) {
        setUser(null);
        setReady(true);
        return;
      }
      const me = await api.me();         // ← 200で {id,email,role[,creatorId]} を返す前提
      setUser(normalizeMe(me));
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { restore(); }, [restore]);

  const login = async (email: string, password: string) => {
    await api.login({ email, password }); // ← api 側で access_token 保存（または戻り値から保存）
    await restore(true);                  // 直後に /me を再取得してヘッダー反映
  };

  const signup = async (email: string, password: string, role: 'fan' | 'creator' = 'fan') => {
    await api.signup({ email, password, role });
    await login(email, password);         // サインアップ後にそのままログイン
  };

  const logout = async () => {
    try { await api.logout?.(); } catch {}
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const value: AuthContextType = { user, ready, login, signup, logout, restore };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}


