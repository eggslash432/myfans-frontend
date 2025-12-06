// front/src/lib/api.ts

import type { KycStatus, PublishedStatus } from "../shared/prisma-enums";
import type { AdminSummary, CreatePlanPayload, CreatePostPayload, CreatorMeResponse, Plan, PlansResponse, PostDetail, PostSummary, ReportItem, UpdatePlanPayload } from "../shared/types";

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

// ---- axios 風ラッパー関数（トップレベル）----

// GET
export async function apiGet<T = any>(
  path: string,
  init?: Omit<RequestOptions, 'method' | 'body'>,
) {
  const data = await request<T>(
    normalizeApiPath(path),
    { ...(init ?? {}), method: 'GET' },
  );
  return { data }; // axios 互換で { data } を返す
}

// POST
export async function apiPost<T = any>(
  path: string,
  body?: any,
  init?: Omit<RequestOptions, 'method' | 'body'>,
) {
  const data = await request<T>(
    normalizeApiPath(path),
    { ...(init ?? {}), method: 'POST', body },
  );
  return { data };
}

// PATCH
export async function apiPatch<T = any>(
  path: string,
  body?: any,
  init?: Omit<RequestOptions, 'method' | 'body'>,
) {
  const data = await request<T>(
    normalizeApiPath(path),
    { ...(init ?? {}), method: 'PATCH', body },
  );
  return { data };
}

// DELETE
export async function apiDelete<T = any>(
  path: string,
  init?: Omit<RequestOptions, 'method' | 'body'>,
) {
  const data = await request<T>(
    normalizeApiPath(path),
    { ...(init ?? {}), method: 'DELETE' },
  );
  return { data };
}

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

  console.log('[request]', { API_BASE, path, url }); 

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

// Post 詳細の正規化
function normalizePostDetail(raw: any): PostDetail {
  if (!raw) return raw as PostDetail;

  // visibility=free の投稿は必ず閲覧可にしておく（暫定措置）
  if (raw.visibility === 'free') {
    return {
      ...raw,
      isLocked: false,
      canView: true,
    } as PostDetail;
  }

  return raw as PostDetail;
}

// axios 互換用: "/creators" → "/api/creators" に揃える
function normalizeApiPath(path: string): string {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) return '/' + path;
  return path; // 先頭 / だけ保証
}

/* ============================================================
 * 認証 / 共通
 * ============================================================ */

// ログイン中ユーザーのサマリ
export function getMeSummary() {
  return request('/users/me/summary');
}

// ★ MyPage.tsx から使う用のラッパー
export async function meSummary() {
  return getMeSummary();
}

// ログインユーザー情報（/auth/me）
export function getMe() {
  return request('/auth/me');
}

export async function login(payload: { email: string; password: string }) {
  const data = await request<{ access_token?: string }>('/auth/login', {
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
  const data = await request<{ access_token?: string }>('/auth/signup', {
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
  await request('/auth/logout', {
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
  return request<{ items: PostSummary[] }>('/posts');
}

// 自分の投稿一覧
export async function getMyPosts() {
  return request<{ items: PostSummary[] }>('/posts/me');
}

// ★ MyPage.tsx から使うためのラッパー
export async function myPosts(): Promise<PostSummary[]> {
  const res = await getMyPosts();     // { items: [...] }
  return res?.items ?? [];
}

// 投稿詳細（シンプル版）
export async function getPostDetail(postId: string) {
  const data = await request<PostDetail>(`/posts/${postId}`);
  return normalizePostDetail(data);
}

// 旧 axios 互換版: api.getPost(postId).then(res => res.data)
export async function getPost(postId: string) {
  const data = await getPostDetail(postId); // ここでもう normalize 済み
  return { data };
}

export async function createPost(payload: CreatePostPayload) {
  // バックエンド側では /posts と /creators/me/posts の両方を受ける実装にしてあるので、
  // ここでは /posts を叩く
  return request<{ ok: true; post: PostSummary }>('/posts', {
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

export async function uploadPostMedia(postId: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  return apiPost<{ ok: boolean; items: { url: string }[] }>(
    `/posts/${postId}/media`,
    formData,
    { json: false },  // FormData をそのまま送る
  );
}

// 投稿通報
export async function reportPost(postId: string, reason: string) {
  return request<{ ok: true }>(`/posts/${postId}/report`, {
    method: 'POST',
    body: { reason },
  });
}

/* ============================================================
 * クリエイター関連
 * ============================================================ */

// クリエイター公開プロフィール（axios互換：{ data } を返す）
async function getCreator(creatorId: string) {
  const data = await request(`/creators/${creatorId}`);
  return { data };          // axios.get() っぽく { data } で返す
}

// クリエイターの公開投稿一覧（axios互換）
async function getCreatorPosts(creatorId: string) {
  const raw = await request<any>(`/creators/${creatorId}/posts`);
  const data = normalizeList<PostSummary>(raw);  // ← {items: [...]} でも配列にしてくれる
  return { data };          // axios 互換で { data: PostSummary[] }
}

// 自分のクリエイター情報（設定画面用）
export async function getCreatorMe() {
  const res = await api.get<CreatorMeResponse>('/creators/me');
  return res.data;   // ★ data を返す
}

// KYC 開始（Stripe Onboarding リンク取得など）
export async function startCreatorKyc() {
  return request<{ url: string }>('/creators/me/kyc/start', {
    method: 'POST',
  });
}

// クリエイタープロフィール更新
export async function updateCreatorProfile(data: {
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  return request('/creators/me', {
    method: 'PATCH',
    body: data,
  });
}

// 特定クリエイターの公開プロフィール（プラン一覧など）
export async function getCreatorPublicProfile(creatorId: string) {
  return request(`/creators/${creatorId}`);
}

// 公開クリエイター一覧（TOP 用）
export async function listCreators() {
  // バックエンドの GET /creators （返り値 {items: [...]}) をそのまま返す
  return request('/creators');
}

// --------------------------------------------------
// クリエイター登録（MyPage.tsx から使われる）
// --------------------------------------------------
// クリエイター登録（MyPage から使用）
export async function applyCreator(dto: {
  publicName?: string;
  displayName?: string;
  bankAccount?: Record<string, any>;
}) {
  return request('/creators', {
    method: 'POST',
    body: dto,   // ← ★ ここが重要
  });
}

/* ============================================================
 * プラン関連
 * ============================================================ */

// 自分のプラン一覧（クリエイター画面用）
export async function getMyPlans(): Promise<PlansResponse> {
  // バックエンド: GET /plans/me
  return request<PlansResponse>('/plans/me');
}

// 特定クリエイターのプラン一覧（ファン向けプロフィール表示など）
export async function getCreatorPlans(
  creatorId: string,
): Promise<PlansResponse> {
  // バックエンド: GET /plans?creatorId=...
  const qs = new URLSearchParams({ creatorId });
  return request<PlansResponse>(`/plans?${qs.toString()}`);
}

export async function createPlan(payload: CreatePlanPayload) {
  return request('/plans', {
    method: 'POST',
    body: payload,
  });
}

// プラン詳細取得
export async function getPlan(planId: string) {
  return request<Plan>(`/plans/${planId}`);
}

// プラン更新
export async function updatePlan(planId: string, payload: UpdatePlanPayload) {
  return request<Plan>(`/plans/${planId}`, {
    method: 'PATCH',
    body: payload,
  });
}

// プラン削除（非アクティブ化）
export async function deactivatePlan(planId: string) {
  return request<Plan>(`/plans/${planId}`, {
    method: 'DELETE',
  });
}

// プラン再開（isActive = true）
export async function reactivatePlan(planId: string) {
  return request<Plan>(`/plans/${planId}/reactivate`, {
    method: 'PATCH',
    body: {}, // JSON送信の形を保つための空ボディ
  });
}

// 並び順更新
export async function reorderPlans(planIds: string[]) {
  return request<{ ok: true }>('/plans/reorder', {
    method: 'PATCH',
    body: { planIds },
  });
}

/* ============================================================
 * 決済 / サブスク / PPV
 * ============================================================ */

// サブスク購読用 Checkout セッション作成（統一エンドポイント版）
export async function createPlanCheckoutSession(planId: string) {
  const successUrl = `${window.location.origin}/mypage?purchase=success`;
  const cancelUrl  = `${window.location.origin}/mypage?purchase=cancel`;

  return request<{ url: string }>('/payments/checkout', {
    method: 'POST',
    body: { planId, successUrl, cancelUrl },
  });
}

// PPV（単品販売）用 Checkout セッション作成
export async function createPpvCheckoutSession(postId: string) {
  // DTO 側の仕様に合わせて successUrl / cancelUrl も送っておく
  const successUrl = window.location.href;
  const cancelUrl  = window.location.href;

  return request<{ url: string }>('/payments/checkout', {
    method: 'POST',
    body: { postId, successUrl, cancelUrl },
  });
}

/* ============================================================
 * 出金（クリエイター側）
 * ============================================================ */

// 出金サマリ
export async function getCreatorPayoutSummary() {
  return request('/creators/me/payouts/summary');
}

// 出金リクエスト作成
export async function requestPayout(amountJpy: number) {
  return request('/creators/me/payouts', {
    method: 'POST',
    body: { amountJpy },
  });
}

// 自分の出金履歴一覧
export async function getCreatorPayoutHistory() {
  return request('/creators/me/payouts/history');
}

/* ============================================================
 * 管理画面: クリエイター管理
 * ============================================================ */

export async function adminListCreators(params?: {
  isListed?: boolean;
  kycStatus?: KycStatus;
}) {
  const qs = new URLSearchParams();
  if (params?.isListed !== undefined) {
    qs.set('isListed', String(params.isListed));
  }
  if (params?.kycStatus) {
    qs.set('kycStatus', params.kycStatus);
  }
  const query = qs.toString();
  const path = query ? `/admin/creators?${query}` : '/admin/creators';

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

// ★ 追加：審査待ちクリエイター一覧（kycStatus=pending）
export async function adminListPendingCreators() {
  return adminListCreators({ 
    isListed: false,
    kycStatus: 'approved',
  });
}

export async function adminSetCreatorListing(
  userId: string,
  isListed: boolean,
) {
  return request<{ ok: true; userId: string; isListed: boolean }>(
    `/admin/creators/${userId}/listing`,
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
  return request<PostSummary[]>('/admin/posts');
}

export async function adminDeletePost(postId: string) {
  return request<{ ok: true }>(`/admin/posts/${postId}`, {
    method: 'DELETE',
  });
}

export async function adminUpdatePostStatus(
  postId: string,
  status: PublishedStatus,
) {
  return request(`/admin/posts/${postId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function adminGetPostReports(postId: string) {
  return request<ReportItem[]>(`/admin/posts/${postId}/reports`);
}

export async function adminResolvePostReport(reportId: string) {
  return request<{ ok: true }>(
    `/admin/posts/reports/${reportId}/resolve`,
    {
      method: 'PATCH',
    },
  );
}

/* ============================================================
 * 管理画面: 通報一覧
 * ============================================================ */

export async function adminListReports() {
  return request<ReportItem[]>('/admin/reports');
}

export async function adminResolveReport(
  reportId: string,
  action: 'reviewed' | 'dismissed' = 'reviewed',
) {
  return request(`/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
    body: { action },
  });
}

/* ============================================================
 * 管理画面: 出金管理
 * ============================================================ */

export async function adminListPayoutRequests() {
  return request('/admin/payouts');
}

export async function adminApprovePayout(payoutId: string) {
  return request(`/admin/payouts/${payoutId}/approve`, {
    method: 'POST',
  });
}

export async function adminRejectPayout(payoutId: string, note?: string) {
  return request(`/admin/payouts/${payoutId}/reject`, {
    method: 'POST',
    body: { note },
  });
}

/* ============================================================
 * 管理画面: サマリ
 * ============================================================ */

export async function adminGetSummary(): Promise<AdminSummary> {
  // バックエンド: Controller('api/admin/summary') @Get()
  // API_BASE が ".../api" なので、ここは "/admin/summary"
  return request<AdminSummary>('/admin/summary');
}


// ============================================================
// エクスポートまとめ
// ============================================================ 


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
  getMyPlans,
  updateCreatorProfile,
  getCreator,
  getCreatorPosts,
  getPost,
  uploadPostMedia,
  getPlan,
  updatePlan,
  deactivatePlan,
  reactivatePlan,
  reorderPlans,  

  // axios 風ラッパー（トップレベル関数への参照）
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
};

// ---- Admin ラッパー ----
export const admin = {
  getSummary: adminGetSummary,

  listCreators: adminListCreators,
  setCreatorListing: adminSetCreatorListing,

  listPendingCreators : adminListPendingCreators,

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
export { api };