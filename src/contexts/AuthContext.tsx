import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

type User = { id: string; email: string; role: 'fan'|'creator'|'admin' };
type AuthContextType = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: 'fan'|'creator') => Promise<void>;
  logout: () => Promise<void>;
  restore: (force?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const getToken = () => localStorage.getItem('access_token');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const restore = useCallback(async (force=false) => {
    try {
      const hasToken = !!getToken();
      if (!hasToken && !force) { setUser(null); setReady(true); return; }
      const me = await api.me();
      setUser(me as User);
    } catch {
      localStorage.removeItem('access_token');
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { restore(); }, [restore]);

  const login = async (email: string, password: string) => {
    await api.login({ email, password });   // access_token保存 or Cookie
    await restore(true);                    // ★ 全アプリに即時反映
  };

  const signup = async (email: string, password: string, role: 'fan'|'creator'='fan') => {
    await api.signup({ email, password, role });
    await login(email, password);
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('access_token');
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
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
