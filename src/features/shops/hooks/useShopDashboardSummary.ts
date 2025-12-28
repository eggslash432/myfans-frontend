// front/src/hooks/useShopDashboardSummary.ts
import { useQuery } from "@tanstack/react-query";
import { request } from "../lib/api/apiClient";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export type ShopMe = {
  shopId: string;
  role: "owner" | "admin" | "staff";
};

export type ShopDashboardSummary = {
  todayGross: number;
  monthGross: number;
  activeSubscribers: number;
  pendingCreatorApplications: number;
};

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeSummary(x: any): ShopDashboardSummary {
  return {
    todayGross: toNumber(x?.todayGross),
    monthGross: toNumber(x?.monthGross),
    activeSubscribers: toNumber(x?.activeSubscribers),
    pendingCreatorApplications: toNumber(x?.pendingCreatorApplications),
  };
}

function mockShopMe(): ShopMe {
  return { shopId: "mock_shop", role: "owner" };
}

function mockDashboardSummary(): ShopDashboardSummary {
  return {
    todayGross: 12800,
    monthGross: 356000,
    activeSubscribers: 42,
    pendingCreatorApplications: 3,
  };
}

async function fetchShopMe(): Promise<ShopMe> {
  if (USE_MOCK) return mockShopMe();
  return request<ShopMe>("/shops/me", { method: "GET" });
}

async function fetchShopDashboardSummary(): Promise<ShopDashboardSummary> {
  if (USE_MOCK) return mockDashboardSummary();

  // ✅ /api は付けない（requestがbaseURL側で付ける）
  const res = await request<any>("/shops/dashboard/summary", { method: "GET" });
  return normalizeSummary(res);
}

export function useShopDashboardSummary() {
  // 先に /shops/me を取得（shopログイン済みか・shopId）
  const meQuery = useQuery({
    queryKey: ["shops", "me"],
    queryFn: fetchShopMe,
    staleTime: 60_000,
    retry: (failureCount, err: any) => {
      const status = err?.status ?? err?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });

  const summaryQuery = useQuery({
    queryKey: ["shop", "dashboard", "summary", meQuery.data?.shopId ?? null],
    queryFn: fetchShopDashboardSummary,
    enabled: !!meQuery.data?.shopId, // ✅ shopId が取れてから叩く
    staleTime: 30_000,
    retry: (failureCount, err: any) => {
      const status = err?.status ?? err?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });

  return {
    me: meQuery.data,
    isLoading: meQuery.isLoading || summaryQuery.isLoading,
    isError: meQuery.isError || summaryQuery.isError,
    error: meQuery.error ?? summaryQuery.error,
    data: summaryQuery.data,
    refetch: summaryQuery.refetch,
  };
}
