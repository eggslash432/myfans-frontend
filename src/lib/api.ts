// 共通HTTPクライアント（JWT自動付与・Cookie両対応・エラー整形）
const BASE = import.meta.env.VITE_API_BASE_URL as string;

export type ApiError = { status: number; message: string };

function getToken() {
  return localStorage.getItem('access_token');
}
function setTokenMaybe(obj: any) {
  // レスポンスのキー揺れに対応
  const t =
    obj?.access_token ??
    obj?.accessToken ??
    obj?.token ??
    obj?.jwt ??
    obj?.data?.access_token ??
    obj?.data?.accessToken;
  if (typeof t === 'string' && t.length > 0) {
    localStorage.setItem('access_token', t);
    return t;
  }
  return null;
}

function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Build headers in a type-safe way (supports Headers, arrays or plain objects)
  const headers = new Headers(init.headers as HeadersInit);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const auth = authHeader();
  for (const [k, v] of Object.entries(auth)) {
    if (v) headers.set(k, String(v));
  }

  const res = await fetch(`${BASE}${path}`, {
    // Cookieベース認証も拾えるよう常に同送
    credentials: 'include',
    ...init,
    headers,
  });

  // 204や空ボディを考慮
  const raw = await res.text();
  const data = raw ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : undefined;

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw { status: res.status, message: msg } as ApiError;
  }
  return data as T;
}

export const api = {
  // --- 認証系 ---
  signup: (dto: { email: string; password: string; role?: 'fan' | 'creator' }) =>
    request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(dto) }),

  login: async (dto: { email: string; password: string }) => {
    const data = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify(dto) });
    // 1) ボディ内トークン（access_token/accessToken/token/jwt）を保存
    const saved = setTokenMaybe(data);
    // 2) もしトークンが無くても Cookie でログイン成立している可能性があるので /users/me を試す
    try { await api.me(); } catch (e) {
      if (!saved) throw e; // Cookieもダメ → 失敗扱い
    }
    return data;
  },

  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => {}),

  me: () => request<{ id: string; email: string; role: string }>('/users/me'),
  meSummary: () => request<any>('/users/me/summary'),

  // --- クリエイター/投稿 ---
  listCreators: (q?: string) => request<any>(`/creators${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getCreator: (id: string) => request<any>(`/creators/${id}`),
  getPost: (id: string) => request<any>(`/posts/${id}`),

  // --- 決済 ---
  createPlanCheckout: (dto: { creatorId: string; planId: string; successUrl: string; cancelUrl: string }) =>
    request<{ sessionId: string }>('/payments/checkout/plan', { method: 'POST', body: JSON.stringify(dto) }),
  createPpvCheckout: (dto: { postId: string; priceId: string; successUrl: string; cancelUrl: string }) =>
    request<{ sessionId: string }>('/payments/checkout/ppv', { method: 'POST', body: JSON.stringify(dto) }),
  mySubscriptions: () => request<any>('/subscriptions/my'),
  myPayments: () => request<any>('/payments/history'),
};
