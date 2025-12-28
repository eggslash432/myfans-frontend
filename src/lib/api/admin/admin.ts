// front/src/lib/api/admin.ts
import { 
  fetchJson, 
  request 
} from '@/lib/api';
import type {
  CreatorApprovalStatus, 
  KycStatus, 
  ReportStatus,
  AdminPayout,
  PendingCreator,
  AdminPost,
  AdminSummary,
  ResolveResult,
  ReportItem,
  FeeSettings,
  AdminUser,
  ListItems,
  UploadSetting,  
  CreatorApplication,
  AdminSalesBreakdown,
  AdminPaymentRow,  
} from '@/shared';


export function adminGetSummary(): Promise<AdminSummary> {
  return request<AdminSummary>('/admin/summary');
}

export function adminListCreators(
  params?: { isListed?: boolean; kycStatus?: KycStatus },
): Promise<PendingCreator[]> {
  const qs = new URLSearchParams();
  if (typeof params?.isListed === 'boolean') qs.set('isListed', String(params.isListed));
  if (params?.kycStatus) qs.set('kycStatus', params.kycStatus);
  const q = qs.toString();
  return request<PendingCreator[]>(`/admin/creators${q ? `?${q}` : ''}`);
}

/** 投稿削除（返り値を使わないなら void でOK） */
export function adminDeletePost(postId: string): Promise<void> {
  return request<void>(`/admin/posts/${postId}`, { method: 'DELETE' });
}

/** クリエイター掲載ON/OFF（返り値を使わないなら void） */
export function adminSetCreatorListing(userId: string, isListed: boolean): Promise<void> {
  return request<void>(`/admin/creators/${userId}/listing`, {
    method: 'PATCH',
    body: { isListed },
  });
}

export function adminListPosts(
  params?: { status?: string; creatorId?: string },
): Promise<AdminPost[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.creatorId) qs.set('creatorId', params.creatorId);
  const q = qs.toString();
  return request<AdminPost[]>(`/admin/posts${q ? `?${q}` : ''}`);
}

/** 投稿ステータス更新（返り値を使わないなら void） */
export function adminUpdatePostStatus(postId: string, status: string): Promise<void> {
  return request<void>(`/admin/posts/${postId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

// export function adminGetPostReports(postId: string): Promise<AdminPostReport[]> {
//   return request<AdminPostReport[]>(`/admin/posts/${postId}/reports`);
// }

/** 通報対応済み（返り値を使わないなら void） */
export function adminResolvePostReport(reportId: string): Promise<void> {
  return request<void>(`/admin/posts/reports/${reportId}/resolve`, {
    method: 'PATCH',
  });
}

export function adminListReports(params?: { status?: string; postId?: string }): Promise<ReportItem[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.postId) qs.set('postId', params.postId);
  const q = qs.toString();
  return request<ReportItem[]>(`/admin/reports${q ? `?${q}` : ''}`);
}

export function adminResolveReport(
  reportId: string,
  action: ReportStatus,
): Promise<ResolveResult> {
  return request<ResolveResult>(`/admin/reports/${reportId}/resolve`, {
    method: 'PATCH',
    body: { action },
  });
}

export function adminListPayoutRequests(): Promise<AdminPayout[]> {
  return request<AdminPayout[]>('/admin/payouts');
}

// 料金・手数料設定取得
export function adminGetFeeSettings(): Promise<FeeSettings> {
  return request<FeeSettings>("/admin/settings/fees");
}

// 料金・手数料設定更新
export function adminUpdateFeeSettings(
  payload: FeeSettings,
): Promise<FeeSettings> {
  return request<FeeSettings>("/admin/settings/fees", {
    method: "PATCH",
    body: payload,
  });
}

/** 管理者一覧（権限区分） */
export async function adminListAdminUsers(): Promise<AdminUser[]> {
  const data = await request<ListItems<AdminUser>>("/admin/users");
  return data.items ?? [];
}

/** 権限更新（返り値を使わないなら void でOK） */
export function adminUpdateAdminRole(
  userId: string,
  role: "admin" | "sub_admin",
): Promise<void> {
  return request<void>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });
}

/** アップロード設定取得 */
export function adminGetUploadSettings(): Promise<UploadSetting> {
  return request<UploadSetting>("/admin/settings/upload");
}

/** アップロード設定更新 */
export function adminUpdateUploadSettings(
  input: UploadSetting,
): Promise<{ ok: true }> {
  return request<{ ok: true }>("/admin/settings/upload", {
    method: "PATCH",
    body: input,
  });
}

// ==============================
// クリエイター申請（approvalStatus）
// ==============================

export function adminListCreatorApplications(params?: {
  status?: CreatorApprovalStatus;
  q?: string;
}): Promise<{ items: CreatorApplication[] }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.q) qs.set('q', params.q);
  const q = qs.toString();
  return request<{ items: CreatorApplication[] }>(
    `/admin/creators/applications${q ? `?${q}` : ''}`,
  );
}

export function adminApproveCreatorApplication(userId: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/admin/creators/applications/${userId}/approve`, {
    method: 'PATCH',
  });
}

export function adminRejectCreatorApplication(userId: string, reason: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/admin/creators/applications/${userId}/reject`, {
    method: 'PATCH',
    body: { reason },
  });
}


export async function adminUpsertShopMember(
  shopId: string,
  input: { userId: string; role: "owner" | "admin" | "staff" }
) {
  return request<{ ok: true; member: any }>(`/admin/shops/${shopId}/members`, {
    method: "POST",
    body: input,
  });
}

// ---- shops list
export async function adminListShops(params?: { q?: string; take?: number; cursor?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.take != null) qs.set("take", String(params.take));
  if (params?.cursor) qs.set("cursor", params.cursor);
  const url = qs.toString() ? `/admin/shops?${qs.toString()}` : "/admin/shops";
  return request<any>(url, { method: "GET" });
}

// ---- shop members list
export async function adminGetShopMembers(shopId: string) {
  return request<any>(`/admin/shops/${shopId}/members`, { method: "GET" });
}

// ---- delete member
export async function adminDeleteShopMember(shopId: string, userId: string) {
  return request<any>(`/admin/shops/${shopId}/members/${userId}`, { method: "DELETE" });
}

// ---- restore owner（body省略＝自分）
export async function adminRestoreShopOwner(shopId: string, body?: { userId?: string }) {
  return request<any>(`/admin/shops/${shopId}/restore-owner`, {
    method: "POST",
    body: body ?? {},
  });
}

// ---- user search（AdminUsersController に GET /admin/users/search を追加してある前提）
export async function adminSearchUsers(params: { q: string; take?: number; cursor?: string }) {
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  if (params.take != null) qs.set("take", String(params.take));
  if (params.cursor) qs.set("cursor", params.cursor);
  return request<any>(`/admin/users/search?${qs.toString()}`, { method: "GET" });
}


export async function adminGetFeeSetting(): Promise<FeeSettings> {
  return fetchJson('/admin/fee-setting');
}

export async function adminGetSalesBreakdown(
  month: string
): Promise<AdminSalesBreakdown> {
  const q = new URLSearchParams({ month });
  return fetchJson(`/admin/sales/breakdown?${q}`);
}

export async function adminListPayments(
  month: string,
  limit = 30
): Promise<AdminPaymentRow[]> {
  const q = new URLSearchParams({ month, limit: String(limit) });
  return fetchJson(`/admin/payments?${q}`);
}