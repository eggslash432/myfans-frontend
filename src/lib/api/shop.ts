// front/src/lib/api/shop.ts

import type { 
  ShopCreatorApplication,
  ShopCreatorApplicationsRes, 
  ShopCreatorApplicationStatus, 
  ShopMe,
  ShopMemberRole,
  ShopSalesRange,
  ShopSalesSummary,
} from "@/shared";
import { request } from "@/lib/api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

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
export async function getShopSalesSummary(range: ShopSalesRange): Promise<ShopSalesSummary> {
  if (USE_MOCK) return mockSalesSummary(range);

  const qs = new URLSearchParams({ range }).toString();
  return request<ShopSalesSummary>(`/shop/sales/summary?${qs}`, { method: "GET" });
}

export type ShopInvite = {
  code: string;
  role: ShopMemberRole;
  expiresAt?: string | null;
};

export async function createShopInvite(input?: { role?: ShopMemberRole; expiresAt?: string }) {
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

export async function getShopMe() {
  return request<ShopMe>("/shop/me", { method: "GET" });
}
