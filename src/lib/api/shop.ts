// front/src/lib/api/shop.ts

import type { ShopCreatorApplicationsRes } from "@/shared/types/shop";
import { request } from "./apiClient";
import { useQuery } from "@tanstack/react-query";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

// ==============================
// Types
// ==============================

export type ShopCreatorApplicationStatus = "pending" | "approved" | "rejected";

export type ShopCreatorApplication = {
  id: string;
  userId: string;
  publicName: string;
  email: string;
  status: ShopCreatorApplicationStatus;
  createdAt: string; // ISO string
  rejectReason?: string | null;
};

export type ShopSalesRange = "today" | "month" | "all";

export type ShopSalesSummary = {
  range: ShopSalesRange;
  gross: number; // 総売上
  platformFee: number; // 手数料
  net: number; // 入金対象
  transactions: number; // 取引数
};

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

// ==============================
// Mocks
// ==============================

function mockCreatorApplications(): ShopCreatorApplication[] {
  return [
    {
      id: "app_1",
      userId: "user_1",
      publicName: "テストクリエイターA",
      email: "a@example.com",
      status: "pending",
      createdAt: "2025-12-14T00:00:00.000Z",
      rejectReason: null,
    },
    {
      id: "app_2",
      userId: "user_2",
      publicName: "テストクリエイターB",
      email: "b@example.com",
      status: "approved",
      createdAt: "2025-12-10T00:00:00.000Z",
      rejectReason: null,
    },
    {
      id: "app_3",
      userId: "user_3",
      publicName: "テストクリエイターC",
      email: "c@example.com",
      status: "rejected",
      createdAt: "2025-12-08T00:00:00.000Z",
      rejectReason: "書類不備",
    },
  ];
}

function mockSalesSummary(range: ShopSalesRange): ShopSalesSummary {
  if (range === "today") {
    return { range, gross: 12800, platformFee: 1280, net: 11520, transactions: 8 };
  }
  if (range === "month") {
    return { range, gross: 356000, platformFee: 35600, net: 320400, transactions: 142 };
  }
  return { range, gross: 1894000, platformFee: 189400, net: 1704600, transactions: 821 };
}

// ==============================
// API
// ==============================

/**
 * 自分の所属Shopの「Creator申請一覧」
 * GET /shop/creator-applications
 */
export async function getShopCreatorApplications(): Promise<ShopCreatorApplication[]> {
  if (USE_MOCK) return mockCreatorApplications();
  return request<ShopCreatorApplication[]>("/shop/creator-applications", { method: "GET" });
}

/**
 * 自分の所属Shopの「売上サマリ」
 * GET /shop/sales/summary?range=today|month|all
 */
export async function getShopSalesSummary(
  range: ShopSalesRange,
): Promise<ShopSalesSummary> {
  if (USE_MOCK) return mockSalesSummary(range);

  const qs = new URLSearchParams({ range }).toString();
  return request<ShopSalesSummary>(`/shop/sales/summary?${qs}`, { method: "GET" });
}

/**
 * Shopダッシュボード サマリ
 * GET /shop/dashboard/summary
 */
export async function getShopDashboardSummary(): Promise<ShopDashboardSummary> {
  if (USE_MOCK) return mockDashboardSummary();
  // ✅ /api は付けない（request側が付ける）
  return request<ShopDashboardSummary>("/shop/dashboard/summary", { method: "GET" });
}

export type ShopInvite = {
  code: string;
  role: "owner" | "admin" | "staff";
  expiresAt?: string | null;
};

export async function createShopInvite(input?: { role?: "staff" | "admin"; expiresAt?: string }) {
  return request<ShopInvite>("/shop/invites", {
    method: "POST",
    body: input ?? {},
  });
}

export async function joinShopByCode(code: string) {
  return request<{ ok: true; already: boolean }>("/shop/join", {
    method: "POST",
    body: { code },
  });
}

export async function createShop(name: string) {
  return request<{ ok: true; already: boolean; shopId?: string } | any>("/shop", {
    method: "POST",
    body: { name },
  });
}

export async function shopListCreatorApplications(params?: {
  status?: ShopCreatorApplicationStatus;
  take?: number;
  cursor?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.take != null) qs.set("take", String(params.take));
  if (params?.cursor) qs.set("cursor", params.cursor);

  const url = qs.toString()
    ? `/shop/creator-applications?${qs.toString()}`
    : "/shop/creator-applications";

  return request<ShopCreatorApplicationsRes>(url, { method: "GET" });
}


export function useShopCreatorApplications() {
  return useQuery({
    queryKey: ["shopCreatorApplications"],
    queryFn: () => shopListCreatorApplications({ status: "pending" }),
  });
}