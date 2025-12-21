// front/src/hooks/useShopDashboardSummary.ts
import { useQuery } from "@tanstack/react-query";
import { request } from "../lib/api/apiClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export type ShopDashboardSummary = {
  todayGross: number;
  monthGross: number;
  activeSubscribers: number;
  pendingCreatorApplications: number;
};

function mockDashboardSummary(): ShopDashboardSummary {
  return {
    todayGross: 12800,
    monthGross: 356000,
    activeSubscribers: 42,
    pendingCreatorApplications: 3,
  };
}

async function fetchShopDashboardSummary(): Promise<ShopDashboardSummary> {
  if (USE_MOCK) return mockDashboardSummary();

  // ✅ ここ重要：/api は付けない（requestがbaseURL側で付ける）
  return request<ShopDashboardSummary>("/shop/dashboard/summary", {
    method: "GET",
  });
}

export function useShopDashboardSummary() {
  return useQuery({
    queryKey: ["shop", "dashboard", "summary"],
    queryFn: fetchShopDashboardSummary,
    staleTime: 30_000,
  });
}
