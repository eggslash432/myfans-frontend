// front/src/lib/api/admin.ts
import { request } from '@/lib';
import type {
  CreatorApprovalStatus, 
  KycStatus, 
  ReportStatus,
  AdminPayout,
  PendingCreator,
  AdminPost,
  AdminSummary,
  ResolveResult,
  ApprovePayoutResult,
  ReportItem,
  FeeSettings,
  AdminUser,
  ListItems,
  UploadSetting,  
  CreatorApplication,  
} from '@/shared';

//
// API
//

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

export function adminApprovePayout(payoutId: string): Promise<ApprovePayoutResult> {
  return request<ApprovePayoutResult>(`/admin/payouts/${payoutId}/approve`, {
    method: 'POST',
  });
}

export function adminRejectPayout(payoutId: string, reason?: string): Promise<void> {
  return request<void>(`/admin/payouts/${payoutId}/reject`, {
    method: 'POST',
    body: reason ? { reason } : {},
  });
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
