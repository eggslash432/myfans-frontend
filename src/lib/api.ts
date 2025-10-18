// 共通HTTPクライアント（JWT自動付与・Cookieリフレッシュ対応・エラー整形）
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "";
const BASE = RAW_BASE.replace(/\/+$/, ""); // 末尾スラ削除安全策

export type ApiError = { status: number; message: string };

function getToken() {
  return localStorage.getItem("access_token");
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
  if (typeof t === "string" && t.length > 0) {
    localStorage.setItem("access_token", t);
    return t;
  }
  return null;
}
function clearToken() {
  localStorage.removeItem("access_token");
}
// function authHeader() {
//   const t = getToken();
//   return t ? { Authorization: `Bearer ${t}` } : {};
// }
function joinUrl(path: string) {
  return path.startsWith("http") ? path : `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// === Token取得保証（/auth/refresh がある前提で試行） ===
async function tryRefresh(): Promise<string | null> {
  try {
    const r = await fetch(joinUrl("/auth/refresh"), {
      method: "POST",
      credentials: "include", // ← Cookieベースのrefresh専用
      headers: { "Content-Type": "application/json" },
    });
    if (!r.ok) return null;
    const raw = await r.text();
    if (!raw) return null;
    let data: any;
    try { data = JSON.parse(raw); } catch { data = raw; }
    return setTokenMaybe(data);
  } catch {
    return null;
  }
}

async function getJson(url: string) {
  const r = await fetch(url, { credentials: "include" });
  const text = await r.text();
  try { return JSON.parse(text); } catch { return text; }
}

// === メインrequest（401→refresh→1回だけ再試行） ===
export async function request<T>(
  path: string,
  init: RequestInit = {},
  requireAuth = false
): Promise<T> {
  // 認証が必須なら、事前にトークンを確保（無ければrefresh）
  if (requireAuth && !getToken()) {
    const t = await tryRefresh();
    if (!t) {
      throw { status: 401, message: "未ログインです（トークン未取得）" } as ApiError;
    }
  }

  // ヘッダ生成（GETにContent-Typeは付けない安全策）
  const headers = new Headers(init.headers as HeadersInit);
  //const method = (init.method || "GET").toUpperCase();
  const hasBody = !!(init as any).body;
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  // 認証ヘッダ（任意でも所持していれば付与）
  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(joinUrl(path), {
    ...init,
    headers,
    // 常時 include は避ける。refresh系でのみCookie送信する方針
  });

  // 成功系：トークンが返ってきたら保存（例：ログイン直後）
  if (res.ok) {
    // 204 No Content は bodyなし
    if (res.status === 204) return undefined as unknown as T;
    const raw = await res.text();
    if (!raw) return undefined as unknown as T;
    let data: any;
    try { data = JSON.parse(raw); } catch { data = raw; }
    setTokenMaybe(data);
    return data as T;
  }

  // 401 → refresh → 1回だけ再試行
  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      // 再試行時：Authorizationを付け直し
      const retryHeaders = new Headers(headers);
      retryHeaders.set("Authorization", `Bearer ${refreshed}`);
      const res2 = await fetch(joinUrl(path), { ...init, headers: retryHeaders });
      if (res2.ok) {
        if (res2.status === 204) return undefined as unknown as T;
        const raw2 = await res2.text();
        if (!raw2) return undefined as unknown as T;
        let data2: any;
        try { data2 = JSON.parse(raw2); } catch { data2 = raw2; }
        setTokenMaybe(data2);
        return data2 as T;
      }
      // 再試行も失敗
      clearToken();
      const txt2 = await res2.text().catch(() => "");
      throw { status: res2.status, message: txt2 || res2.statusText } as ApiError;
    }
    // refresh不可
    clearToken();
  }

  // それ以外のエラー
  const text = await res.text().catch(() => "");
  let msg: string = text || res.statusText;
  try {
    const j = JSON.parse(text);
    msg = j?.message || j?.error || msg;
  } catch {}
  throw { status: res.status, message: msg } as ApiError;
}

// === プランAPI（元の関数は活かしつつ、必要な箇所だけ requireAuth 付与） ===
export type Plan = {
  id: string;
  creatorId: string;
  name: string;
  priceJpy: number;
  description?: string | null;
  isActive: boolean;
  externalPriceId?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
export type PlansResponse = { ok: true; plans: Plan[] };

export async function getMyPlans(): Promise<PlansResponse> {
  return request<PlansResponse>("/creators/me/plans", { method: "GET" }, /* requireAuth= */ true);
}
export async function getCreatorPlans(creatorId: string): Promise<PlansResponse> {
  return request<PlansResponse>(`/creators/${creatorId}/plans`, { method: "GET" });
}

// === Post作成：候補パスに順次POST（要JWT） ===
export async function createPostSmart(
  dto: {
    title: string;
    content: string;
    visibility: "free" | "paid" | "ppv";
    price?: number | null;
    status?: "draft" | "published";
  },
  opts?: { creatorId?: string }
) {
  const cid = opts?.creatorId;
  const candidates = [
    { path: "/posts", body: dto },
    { path: "/creators/me/posts", body: dto },
    { path: "/creators/posts", body: dto },
    ...(cid ? [{ path: `/creators/${cid}/posts`, body: dto }] : []),
    { path: "/creator/posts", body: dto },
  ];

  let lastErr: any = null;
  for (const c of candidates) {
    try {
      const res = await request<any>(
        c.path,
        { method: "POST", body: JSON.stringify(c.body) },
        /* requireAuth= */ true
      );
      return { ok: true, path: c.path, data: res };
    } catch (e: any) {
      lastErr = e;
      if (e?.status !== 404 && e?.status !== 405) throw e; // 404/405以外は即エラー
    }
  }
  throw new Error(lastErr?.message || "Post API not found");
}

// === 汎用ラッパ ===
export const apiGet = <T = any>(path: string, requireAuth = false) =>
  request<T>(path, { method: "GET" }, requireAuth);

export const apiPost = <T = any>(path: string, body?: any, requireAuth = true) =>
  request<T>(
    path,
    { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined },
    requireAuth
  );

export const apiPut = <T = any>(path: string, body?: any, requireAuth = true) =>
  request<T>(
    path,
    { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined },
    requireAuth
  );

export const apiDelete = <T = any>(path: string, requireAuth = true) =>
  request<T>(path, { method: "DELETE" }, requireAuth);

// === ここから高レベルAPI ===
export const api = {
  // --- 認証 ---
  signup: (dto: { email: string; password: string; role?: "fan" | "creator" }) =>
    request<any>("/auth/signup", { method: "POST", body: JSON.stringify(dto) }),

  login: async (dto: { email: string; password: string }) => {
    const data = await request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    const saved = setTokenMaybe(data);
    if (!saved) {
      // Cookieだけ返すAPI構成なら refresh を試す
      const t = await tryRefresh();
      if (t) return { ...data, access_token: t };
      throw {
        status: 401,
        message: "サーバが access_token を返しませんでした。/auth/refresh の有効化をご確認ください。",
      } as ApiError;
    }
    return data;
  },

  logout: () => request("/auth/logout", { method: "POST" }).catch(() => {}),

  // BEが /auth/me の場合に統一（/users/me を使っていた箇所を修正）
  me: () => request<{ id: string; email: string; role: string }>("/auth/me", { method: "GET" }, true),

  // 必要なら残す（存在しないBEなら呼ばない）
  meSummary: () => request<any>("/users/me/summary", { method: "GET" }, true),

  // --- クリエイター/投稿 ---
  async listCreators(): Promise<any[]> {
    const data = await getJson(`${BASE}/creators`);
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.creators)) return (data as any).creators;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    return [];
  },

  getCreator: (id: string) => request<any>(`/creators/${id}`),

  getPost: (id: string) => request<any>(`/posts/${id}`),

  myPosts: () => request<any>("/posts/me", { method: "GET" }, true),

  createPost: (dto: any) =>
    request("/creators/me/posts", { method: "POST", body: JSON.stringify(dto) }, true),

  // --- 決済（必ず requireAuth=true） ---
  createPlanCheckout: (dto: {
    creatorId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }) =>
    request<{ sessionId: string }>(
      "/payments/checkout/plan",
      { method: "POST", body: JSON.stringify(dto) },
      true
    ),

  createPpvCheckout: (dto: {
    postId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }) =>
    request<{ sessionId: string }>(
      "/payments/checkout/ppv",
      { method: "POST", body: JSON.stringify(dto) },
      true
    ),

  myPayments: () => request<any>("/payments/history", { method: "GET" }, true),

  mySubscriptions: () => request<any>("/subscriptions/my", { method: "GET" }, true),

  // --- 既存コード後方互換: api.get / api.post を提供 ---
  get: <T = any>(path: string, requireAuth = false) =>
    request<T>(path, { method: "GET" }, requireAuth),

  post: <T = any>(path: string, body?: any, requireAuth = true) =>
    request<T>(
      path,
      { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined },
      requireAuth
    ),  
};
