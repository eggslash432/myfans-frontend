import { request } from "@/lib/api";
import type { AdminCreateShopRes } from "@/shared";

export async function adminUpsertShopMember(
  shopId: string,
  input: { userId: string; role: "owner" | "admin" | "staff" },
) {
  return request<{ ok: true; member: any }>(`/admin/shops/${shopId}/members`, {
    method: "POST",
    body: input,
  });
}

export async function adminCreateShop(input: {
  name: string;
  ownerUserId?: string | null;
}) {
  return request<AdminCreateShopRes>("/shops", {
    method: "POST",
    body: input,
  });
}

export async function adminListShops(params?: { q?: string; take?: number; cursor?: string }) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.take != null) qs.set("take", String(params.take));
  if (params?.cursor) qs.set("cursor", params.cursor);
  const url = qs.toString() ? `/admin/shops?${qs.toString()}` : "/admin/shops";
  return request<any>(url, { method: "GET" });
}

export async function adminGetShopMembers(shopId: string) {
  return request<any>(`/admin/shops/${shopId}/members`, { method: "GET" });
}

export async function adminDeleteShopMember(shopId: string, userId: string) {
  return request<any>(`/admin/shops/${shopId}/members/${userId}`, { method: "DELETE" });
}

export async function adminRestoreShopOwner(shopId: string, body?: { userId?: string }) {
  return request<any>(`/admin/shops/${shopId}/restore-owner`, {
    method: "POST",
    body: body ?? {},
  });
}
