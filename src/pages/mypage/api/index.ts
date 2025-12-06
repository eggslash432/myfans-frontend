const BASE = import.meta.env.VITE_API_BASE_URL; // 例: http://localhost:3001

export async function fetchMe() {
  const token = localStorage.getItem('access_token'); // あなたの保存キー名に合わせて
  const res = await fetch(`${BASE}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // Cookieベースなら必要だが、Bearerなら無くてもOK。両対応で残しておいてよい
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchPaymentHistory(userId: string) {
  const res = await fetch(`${BASE}/payments/history?userId=${userId}`, {
    credentials: 'include',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createCheckoutSession(planId: string) {
  // サーバー（Nest or your SPA backend）側にセッション作成APIを用意しておく
  const res = await fetch(`/api/checkout/session`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ planId }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('failed to create checkout session');
  return res.json() as Promise<{ sessionId: string; pubKey: string }>;
}
