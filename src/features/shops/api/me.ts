// front/src/features/shops/api/me.ts
import { request } from "@/lib/api";
import type { ShopMe } from "@/shared";

export function getShopMe(): Promise<ShopMe> {
  return request<ShopMe>("/shops/me", { method: "GET" });
}
