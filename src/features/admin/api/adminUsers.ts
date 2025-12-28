import { request } from "@/lib/api";
import type { AdminUser, ListResponse } from "@/shared";

/** 管理者一覧（権限区分） */
export async function adminListAdminUsers(): Promise<AdminUser[]> {
  const data = await request<ListResponse<AdminUser>>("/admin/users");
  return data.items ?? [];
}

/** 権限更新（返り値を使わないなら void でOK） */
export function adminUpdateAdminRole(userId: string, role: "admin" | "sub_admin"): Promise<void> {
  return request<void>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: { role },
  });
}

/** user search（AdminUsersController に GET /admin/users/search を追加してある前提） */
export async function adminSearchUsers(params: { q: string; take?: number; cursor?: string }) {
  const qs = new URLSearchParams();
  qs.set("q", params.q);
  if (params.take != null) qs.set("take", String(params.take));
  if (params.cursor) qs.set("cursor", params.cursor);
  return request<any>(`/admin/users/search?${qs.toString()}`, { method: "GET" });
}
