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

// ★追加：トークンを必ず用意する（無ければ /auth/refresh を試す）
async function ensureToken(): Promise<string> {
  const t0 = getToken();
  if (t0) return t0;

  // リフレッシュがある場合だけ試す（無ければそのままエラーへ）
  try {
    const r = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (r.ok) {
      const raw = await r.text();
      const data = raw ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : undefined;
      const t1 = setTokenMaybe(data);
      if (t1) return t1;
    }
  } catch {}

  throw { status: 401, message: '未ログインです（アクセストークンがありません）' } as ApiError;
}

export async function request<T>(path: string, init: RequestInit = {}, requireAuth = false): Promise<T> {
  // 認証が必須ならリフレッシュまで保証、任意ならローカルのトークンだけ使う
  const token = requireAuth ? await ensureToken() : getToken();   // ← ここを変更

  const headers = new Headers(init.headers as HeadersInit);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);              // ← 常に付与
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });

  const raw = await res.text();
  const data = raw ? (() => { try { return JSON.parse(raw); } catch { return raw; } })() : undefined;

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || res.statusText;
    throw { status: res.status, message: msg } as ApiError;
  }
  return data as T;
}


// 既存の request はそのまま（または前回のまま）
// これを追加/置き換えしてください
export async function createPostSmart(
  dto: {
    title: string;
    content: string;
    visibility: 'free' | 'paid' | 'ppv';
    price?: number | null;
    status?: 'draft' | 'published';
  },
  opts?: { creatorId?: string }
) {
  const cid = opts?.creatorId;

  // よくある命名を広くカバー
  const candidates = [
    { path: '/posts', body: dto },                                  // ① /posts
    { path: '/creators/me/posts', body: dto },                      // ② /creators/me/posts
    { path: '/creators/posts', body: dto },                         // ③ /creators/posts
    ...(cid ? [{ path: `/creators/${cid}/posts`, body: dto }] : []),// ④ /creators/:id/posts
    { path: '/creator/posts', body: dto },                          // ⑤ /creator/posts（単数）
  ];

  let lastErr: any = null;
  for (const c of candidates) {
    try {
      const res = await request<any>(c.path, {
        method: 'POST',
        body: JSON.stringify(c.body),
      });
      return { ok: true, path: c.path, data: res }; // ← どれに当たったか返す
    } catch (e: any) {
      lastErr = e;
      if (e.status !== 404 && e.status !== 405) { // 404/405以外は即エラー
        throw e;
      }
      // 404/405は次候補へ
    }
  }
  // どれも当たらなかった
  throw new Error(lastErr?.message || 'Post API not found');
}

// すでにある request() を使ったシンプルなラッパー
export const apiGet = <T = any>(path: string) =>
  request<T>(path);

export const apiPost = <T = any>(path: string, body?: any, requireAuth = true) =>
  request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }, requireAuth);

// （必要なら）
export const apiPut = <T = any>(path: string, body?: any, requireAuth = true) =>
  request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }, requireAuth);

export const apiDelete = <T = any>(path: string, requireAuth = true) =>
  request<T>(path, { method: 'DELETE' }, requireAuth);


export const api = {
  // --- 認証系 ---
  signup: (dto: { email: string; password: string; role?: 'fan' | 'creator' }) =>
    request<any>('/auth/signup', { method: 'POST', body: JSON.stringify(dto) }),

  login: async (dto: { email: string; password: string }) => {
    const data = await request<any>('/auth/login', { method: 'POST', body: JSON.stringify(dto) });
    const saved = setTokenMaybe(data);

    if (!saved) {
      // Cookieだけ返すAPI構成なら、/auth/refresh を試してみる
      try {
        const t = await ensureToken(); // ← 成功すればOK
        return { ...data, access_token: t };
      } catch {
        throw { status: 401, message: 'サーバが access_token を返しませんでした。API を修正するか、/auth/refresh を有効化してください。' } as ApiError;
      }
    }
    return data;
  },

  logout: () => request('/auth/logout', { method: 'POST' }).catch(() => {}),

  me: () => request<{ id: string; email: string; role: string }>('/users/me'),
  meSummary: () => request<any>('/users/me/summary', {}, true),

  // --- 共通GET ---
  get: <T = any>(path: string) => request<T>(path),

  // ★共通POST（これを追加）
  post: <T = any>(path: string, body?: any, requireAuth = true) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }, requireAuth),

  // --- クリエイター/投稿 ---
  listCreators: (q?: string) => request<any>(`/creators${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getCreator: (id: string) => request<any>(`/creators/${id}`),
  getPost: (id: string) => request<any>(`/posts/${id}`),
  myPosts: () => request<any>('/posts/me', {}, true),
  createPost: (dto: any) => request('/creators/me/posts', { method: 'POST', body: JSON.stringify(dto) }, /* requireAuth= */ true),

  // --- 決済 ---
  createPlanCheckout: (dto: { creatorId: string; planId: string; successUrl: string; cancelUrl: string }) =>
    request<{ sessionId: string }>('/payments/checkout/plan', { method: 'POST', body: JSON.stringify(dto) }),
  createPpvCheckout: (dto: { postId: string; priceId: string; successUrl: string; cancelUrl: string }) =>
    request<{ sessionId: string }>('/payments/checkout/ppv', { method: 'POST', body: JSON.stringify(dto) }),
  myPayments: () => request<any>('/payments/history', {}, true),
  mySubscriptions: () => request<any>('/subscriptions/my', {}, true),
};
