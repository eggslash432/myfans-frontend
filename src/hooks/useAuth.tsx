// front/src/hooks/useAuth.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import api from '../lib/api'; // 既存の api ラッパー
import type { User } from '../shared/types';
import type { Role } from '../shared/prisma-enums';

type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: (force?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const getToken = () => localStorage.getItem('access_token');

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
    try {
      const hasToken = !!getToken();
      if (!hasToken && !force) {
        setUser(null);
        setReady(true);
        return;
      }

      const me = await api.me(); // /auth/me
      setUser(normalizeMe(me));
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    restore();
  }, [restore]);

  const login = async (email: string, password: string) => {
    await api.login({ email, password });
    await restore(true);
  };

  const signup = async (email: string, password: string) => {
    await api.signup({ email, password, role: 'fan' });
    await login(email, password);
  };

  const logout = async () => {
    try {
      await api.logout?.();
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
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
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return ctx;
}
