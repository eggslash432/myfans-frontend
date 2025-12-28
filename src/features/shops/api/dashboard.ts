// front/src/features/shops/api/dashboard.ts
import { request } from "@/lib/api";
import type { ShopDashboardSummary } from "@/shared";
import { USE_MOCK, mockDashboardSummary } from "./mock";

export async function getShopDashboardSummary(): Promise<ShopDashboardSummary> {
  if (USE_MOCK) return mockDashboardSummary();
  return request<ShopDashboardSummary>("/shops/dashboard/summary", { method: "GET" });
}
