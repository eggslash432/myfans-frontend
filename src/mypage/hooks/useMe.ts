// /mypage/hooks/useMe.ts
import { useEffect, useState } from 'react';
import {api} from '../../lib/api';

type Me = {
  id: string;
  email: string;
  nickname?: string;
  // 必要に応じて型追加
};

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // ★ バックエンドの実パスに合わせて下さい
        // 例1: GET /users/me/summary → { user, subscriptions, payments } を想定
        // 例2: GET /users/me       → { id, email, ... }
        const { data } = await api.get('/users/me/summary'); // ←ここを必要に応じ変更
        const user = data?.user ?? data; // /me の場合は data が user
        if (alive) setMe(user);
      } catch (e: any) {
        console.error('useMe error:', e);
        // CORSやネットワーク断は message が "Network Error" や "Failed to fetch" になりやすい
        const msg =
          e?.response?.data?.message ??
          e?.message ??
          'Failed to fetch';
        if (alive) setErr(String(msg));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { me, loading, err };
}
