import { request } from "@/lib/api";
import type { ReportItem, ReportStatus, ResolveResult } from "@/shared";

/** 通報一覧 */
export function adminListReports(params?: { status?: string; postId?: string }): Promise<ReportItem[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.postId) qs.set("postId", params.postId);
  const q = qs.toString();
  return request<ReportItem[]>(`/admin/reports${q ? `?${q}` : ""}`);
}

/** 通報対応 */
export function adminResolveReport(reportId: string, action: ReportStatus): Promise<ResolveResult> {
  return request<ResolveResult>(`/admin/reports/${reportId}/resolve`, {
    method: "PATCH",
    body: { action },
  });
}

/** 投稿通報：対応済み（既存の古いエンドポイントがあるなら残す） */
export function adminResolvePostReport(reportId: string): Promise<void> {
  return request<void>(`/admin/posts/reports/${reportId}/resolve`, { method: "PATCH" });
}
