// front/src/features/shops/api/sales.ts
import { request } from "@/lib/api";
import type { ShopSalesRange, ShopSalesSummary } from "@/shared";
import { USE_MOCK, mockSalesSummary } from "./mock";

/**
 * 自分の所属Shopの「売上サマリ」
 * GET /shops/sales/summary?range=today|month|all
 */
export async function getShopSalesSummary(range: ShopSalesRange): Promise<ShopSalesSummary> {
  if (USE_MOCK) return mockSalesSummary(range);

  const qs = new URLSearchParams({ range }).toString();
  return request<ShopSalesSummary>(`/shops/sales/summary?${qs}`, { method: "GET" });
}
