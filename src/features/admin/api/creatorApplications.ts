import { request } from "@/lib/api";
import type { CreatorApprovalStatus, CreatorApplication } from "@/shared";

export function adminListCreatorApplications(params?: {
  status?: CreatorApprovalStatus;
  q?: string;
}): Promise<{ items: CreatorApplication[] }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  const q = qs.toString();
  return request<{ items: CreatorApplication[] }>(
    `/admin/creators/applications${q ? `?${q}` : ""}`,
  );
}

export function adminApproveCreatorApplication(userId: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/admin/creators/applications/${userId}/approve`, {
    method: "PATCH",
  });
}

export function adminRejectCreatorApplication(userId: string, reason: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/admin/creators/applications/${userId}/reject`, {
    method: "PATCH",
    body: { reason },
  });
}
