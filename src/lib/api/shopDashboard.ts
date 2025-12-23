// front/src/lib/api/shopDashboard.ts

import { request } from "./apiClient";

export type ShopDashboardSummary = {
  todayGross: number;
  monthGross: number;
  activeSubscribers: number;
  pendingCreatorApplications: number;
};

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

function mockSummary(): ShopDashboardSummary {
  return {
    todayGross: 12800,
    monthGross: 356000,
    activeSubscribers: 142,
    pendingCreatorApplications: 3,
  };
}

export async function getShopDashboardSummary(): Promise<ShopDashboardSummary> {
  if (USE_MOCK) return mockSummary();
  return request<ShopDashboardSummary>("/shops/dashboard/summary", { method: "GET" });
}

