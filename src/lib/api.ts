// front/src/lib/api.ts

import type { KycStatus, PublishedStatus, Visibility } from "../shared/prisma-enums";
import type { CreatorMeResponse, PlansResponse, PostDetail, PostSummary, ReportItem } from "../shared/types";

// API ベースURL
// 例: VITE_API_BASE_URL = "https://api.example.com"
// 未指定ならフロントと同じオリジンの /api を使う
const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any, message?: string) {
    super(message ?? body?.message ?? 'API Error');
    this.status = status;
    this.body = body;
  }
}

// type RequestInitEx = RequestInit & {
//   // JSON を送るとき true（デフォルト）
//   json?: boolean;
// };

// 代わりにこっちを使う
type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: any;      // ← ここを BodyInit じゃなく any にする
  json?: boolean;  // JSON を自動で stringify するフラグ
};

/**
 * 共通 request ラッパ
 * - credentials: 'include' で Cookie ベースのセッションにも対応
 * - エラー時は ApiError を throw
 */
async function request<T = unknown>(
  path: string,
  init: RequestOptions = {},
): Promise<T> {
  const { json = true, headers, body, ...rest } = init;

  let url: string;

  if (path.startsWith('http')) {
    // フルURLが渡されたときはそのまま
    url = path;
  } else {
    // 先頭の /api は一旦削る（/api/creators/me → /creators/me）
    let p = path;

    // 先頭に / を付けて整形
    if (!p.startsWith('/')) {
      p = '/' + p;
    }

    // 最終的に "http://localhost:3000/api + /creators/me" みたいな形にする
    url = `${API_BASE}${p}`;
  }

  // ★ ここで token を取得
  const token = localStorage.getItem('access_token');  

  const finalInit: RequestInit = {
    credentials: 'include',
    ...rest,
    headers: {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: json && body && typeof body !== 'string'
      ? JSON.stringify(body)
      : body,
  };

  const res = await fetch(url, finalInit);

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data, data?.message);
  }

  return data as T;
}

function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// 生データを {items: [...] } や配列から統一して配列にするヘルパー
export function normalizeList<T = any>(raw: any): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items)) return raw.items;
  return [];
}

// axios 互換用: "/creators" → "/api/creators" に揃える
function normalizeApiPath(path: string): string {
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api/')) return path;
  if (path.startsWith('/')) return '/api' + path;
  return '/api/' + path;
}

/* ============================================================
 * 認証 / 共通
 * ============================================================ */

// ログイン中ユーザーのサマリ
export function getMeSummary() {
  return request('/api/users/me/summary');
}

// ★ MyPage.tsx から使う用のラッパー
export async function meSummary() {
  return getMeSummary();
}

// ログインユーザー情報（/auth/me）
export function getMe() {
  return request('/api/auth/me');
}

export async function login(payload: { email: string; password: string }) {
  const data = await request<{ access_token?: string }>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });

  // ★ API から返ってきた token を保存
  if (data?.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }

  return data;
}

export async function signup(payload: {
  email: string;
  password: string;
  role?: 'fan' | 'creator';
}) {
  const data = await request<{ access_token?: string }>('/api/auth/signup', {
    method: 'POST',
    body: payload,
  });

  // ★ サインアップ直後にログインさせたい場合
  if (data?.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }

  return data;
}

export async function logout() {
  await request('/api/auth/logout', {
    method: 'POST',
  });
  // ★ ログアウト時に token 削除
  localStorage.removeItem('access_token');
}



/* ============================================================
 * 投稿関連
 * ============================================================ */

// 公開フィード
export async function getPublicPosts() {
  return request<{ items: PostSummary[] }>('/api/posts');
}

// 自分の投稿一覧
export async function getMyPosts() {
  return request<{ items: PostSummary[] }>('/api/posts/me');
}

// ★ MyPage.tsx から使うためのラッパー
export async function myPosts(): Promise<PostSummary[]> {
  const res = await getMyPosts();     // { items: [...] }
  return res?.items ?? [];
}

// 投稿詳細
export async function getPostDetail(postId: string) {
  return request<PostDetail>(`/api/posts/${postId}`);
}

// 投稿作成
export type CreatePostPayload = {
  title: string;
  body?: string;
  visibility: Visibility;
  planId?: string | null;
  priceJpy?: number | null;
  ageRating?: 'all' | 'r18';
  publishedStatus?: PublishedStatus | 'draft' | 'published' | 'private';
};

export async function createPost(payload: CreatePostPayload) {
  // バックエンド側では /posts と /creators/me/posts の両方を受ける実装にしてあるので、
  // ここでは /posts を叩く
  return request<{ ok: true; post: PostSummary }>('/api/posts', {
    method: 'POST',
    body: payload,
  });
}

// 高機能版 createPost（旧 createPostSmart）
// NewPost.tsx がこれを使う想定になっている
export async function createPostSmart(payload: CreatePostPayload) {
  const body: CreatePostPayload = {
    title: payload.title ?? '',
    body: payload.body ?? '',
    visibility: payload.visibility,
    planId: payload.planId ?? null,
    priceJpy: payload.priceJpy ?? null,
    ageRating: payload.ageRating ?? 'all',
    publishedStatus: payload.publishedStatus ?? 'published',
  };

  return createPost(body);
}

// 投稿通報
export async function reportPost(postId: string, reason: string) {
  return request<{ ok: true }>(`/api/posts/${postId}/report`, {
    method: 'POST',
    body: { reason },
  });
}

/* ============================================================
 * クリエイター関連
 * ============================================================ */

// 自分のクリエイター情報（設定画面用）
export async function getCreatorMe() {
  return request<CreatorMeResponse>('/api/creators/me');
}

// KYC 開始（Stripe Onboarding リンク取得など）
export async function startCreatorKyc() {
  return request<{ url: string }>('/api/creators/me/kyc/start', {
    method: 'POST',
  });
}

// クリエイタープロフィール更新
export async function updateCreatorProfile(data: {
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  return request('/api/creators/me', {
    method: 'PATCH',
    body: data,
  });
}

// 特定クリエイターの公開プロフィール（プラン一覧など）
export async function getCreatorPublicProfile(creatorId: string) {
  return request(`/api/creators/${creatorId}`);
}

// 公開クリエイター一覧（TOP 用）
export async function listCreators() {
  // バックエンドの GET /creators （返り値 {items: [...]}) をそのまま返す
  return request('/api/creators');
}

// --------------------------------------------------
// クリエイター登録（MyPage.tsx から使われる）
// --------------------------------------------------
export async function applyCreator() {
  return request('/api/creators', {
    method: 'POST',
  });
}

/* ============================================================
 * プラン関連
 * ============================================================ */

// 自分のプラン一覧
export async function getMyPlans(): Promise<PlansResponse> {
  // バックエンド: GET /plans（ログイン中クリエイターのプラン）
  return request<PlansResponse>('/api/plans');
}

// 特定クリエイターのプラン一覧
export async function getCreatorPlans(creatorId: string): Promise<PlansResponse> {
  // バックエンド: GET /plans/me?creatorId=...
  // 実装に合わせてパスを変えるならここを調整
  return request<PlansResponse>(`/api/plans/me?creatorId=${encodeURIComponent(creatorId)}`);
}

// ★ 新規プラン作成
export type CreatePlanPayload = {
  name: string;
  priceJpy: number;
};

export async function createPlan(payload: CreatePlanPayload) {
  return request('/api/plans', {
    method: 'POST',
    body: payload,
  });
}

/* ============================================================
 * 決済 / サブスク / PPV
 * ============================================================ */

// サブスク購読用 Checkout セッション作成
export async function createPlanCheckoutSession(planId: string) {
  return request<{ url: string }>('/api/payments/checkout/subscription', {
    method: 'POST',
    body: { planId },
  });
}

// PPV（単品販売）用 Checkout セッション作成
export async function createPpvCheckoutSession(postId: string) {
  return request<{ url: string }>('/api/payments/checkout/one-time', {
    method: 'POST',
    body: { postId },
  });
}

/* ============================================================
 * 出金（クリエイター側）
 * ============================================================ */

// 出金サマリ
export async function getCreatorPayoutSummary() {
  return request('/api/creators/me/payouts/summary');
}

// 出金リクエスト作成
export async function requestPayout(amountJpy: number) {
  return request('/api/creators/me/payouts', {
    method: 'POST',
    body: { amountJpy },
  });
}

// 自分の出金履歴一覧
export async function getCreatorPayoutHistory() {
  return request('/api/creators/me/payouts/history');
}

/* ============================================================
 * 管理画面: クリエイター管理
 * ============================================================ */

export async function adminListCreators(params?: {
  isListed?: boolean;
  kycStatus?: KycStatus | 'pending' | 'rejected';
}) {
  const qs = new URLSearchParams();
  if (params?.isListed !== undefined) {
    qs.set('isListed', String(params.isListed));
  }
  if (params?.kycStatus) {
    qs.set('kycStatus', params.kycStatus);
  }
  const query = qs.toString();
  const path = query ? `/api/admin/creators?${query}` : '/api/admin/creators';

  return request<
    {
      userId: string;
      email: string;
      publicName: string;
      isListed: boolean;
      stripeKycStatus?: string | null;
      stripeChargesEnabled: boolean;
      stripePayoutsEnabled: boolean;
      createdAt: string;
      userCreatedAt?: string;
      postsCount: number;
      subsCount: number;
      payoutsCount: number;
    }[]
  >(path);
}

export async function adminSetCreatorListing(
  userId: string,
  isListed: boolean,
) {
  return request<{ ok: true; userId: string; isListed: boolean }>(
    `/api/admin/creators/${userId}/listing`,
    {
      method: 'PATCH',
      body: { isListed },
    },
  );
}

/* ============================================================
 * 管理画面: 投稿管理
 * ============================================================ */

export async function adminListPosts() {
  return request<PostSummary[]>('/api/admin/posts');
}

export async function adminDeletePost(postId: string) {
  return request<{ ok: true }>(`/api/admin/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function adminUpdatePostStatus(
  postId: string,
  status: PublishedStatus,
) {
  return request(`/api/admin/posts/${postId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function adminGetPostReports(postId: string) {
  return request<ReportItem[]>(`/api/admin/posts/${postId}/reports`);
}

export async function adminResolvePostReport(reportId: string) {
  return request<{ ok: true }>(
    `/api/admin/posts/reports/${reportId}/resolve`,
    {
      method: 'PATCH',
    },
  );
}

/* ============================================================
 * 管理画面: 通報一覧
 * ============================================================ */

export async function adminListReports() {
  return request<ReportItem[]>('/api/admin/reports');
}

export async function adminResolveReport(
  reportId: string,
  action: 'reviewed' | 'dismissed' = 'reviewed',
) {
  return request(`/api/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
    body: { action },
  });
}

/* ============================================================
 * 管理画面: 出金管理
 * ============================================================ */

export async function adminListPayoutRequests() {
  return request('/api/admin/payouts');
}

export async function adminApprovePayout(payoutId: string) {
  return request(`/api/admin/payouts/${payoutId}/approve`, {
    method: 'POST',
  });
}

export async function adminRejectPayout(payoutId: string, note?: string) {
  return request(`/api/admin/payouts/${payoutId}/reject`, {
    method: 'POST',
    body: { note },
  });
}

// useAuth.tsx から使うためのラッパー
const api = {
  me: getMe,
  login,
  signup,
  logout,
  listCreators,
  createPostSmart,
  createPlan,
  myPosts,
  getCreatorMe,
  meSummary,
  applyCreator,
  startCreatorKyc,
  // ★ ここから axios 風ラッパー（古い画面との互換用）★
  async get<T = any>(
    path: string,
    init?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    const data = await request<T>(
      normalizeApiPath(path),
      { ...(init ?? {}), method: 'GET' }
    );
    // axios 互換で { data } を返す
    return { data };
  },

  async post<T = any>(
    path: string,
    body?: any,
    init?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    const data = await request<T>(
      normalizeApiPath(path),
      { ...(init ?? {}), method: 'POST', body }
    );
    return { data };
  },
};

// ---- Admin ラッパー ----
export const admin = {
  listCreators: adminListCreators,
  setCreatorListing: adminSetCreatorListing,

  listPosts: adminListPosts,
  deletePost: adminDeletePost,
  updatePostStatus: adminUpdatePostStatus,
  getPostReports: adminGetPostReports,
  resolvePostReport: adminResolvePostReport,

  listReports: adminListReports,
  resolveReport: adminResolveReport,

  listPayoutRequests: adminListPayoutRequests,
  approvePayout: adminApprovePayout,
  rejectPayout: adminRejectPayout,
};

export default api;
export { 
  api, 
};