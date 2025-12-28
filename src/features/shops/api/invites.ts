// front/src/features/shops/api/invites.ts
import { request } from "@/lib/api";
import type { ShopInvite, ShopMemberRole } from "@/shared";

export function createShopInvite(input?: { role?: ShopMemberRole; expiresAt?: string }) {
  return request<ShopInvite>("/shops/invites", {
    method: "POST",
    body: input ?? {},
  });
}

export function joinShopByCode(code: string) {
  return request<{ ok: true; already: boolean }>("/shops/join", {
    method: "POST",
    body: { code },
  });
}
