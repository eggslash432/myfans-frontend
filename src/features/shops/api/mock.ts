// front/src/features/shops/api/mock.ts
import type {
  ShopCreatorApplication,
  ShopDashboardSummary,
  ShopSalesRange,
  ShopSalesSummary,
} from "@/shared";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export function mockCreatorApplications(): ShopCreatorApplication[] {
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

export function mockSalesSummary(range: ShopSalesRange): ShopSalesSummary {
  if (range === "today") {
    return { range, gross: 12800, platformFee: 1280, net: 11520, transactions: 8 };
  }
  if (range === "month") {
    return { range, gross: 356000, platformFee: 35600, net: 320400, transactions: 142 };
  }
  return { range, gross: 1894000, platformFee: 189400, net: 1704600, transactions: 821 };
}

export function mockDashboardSummary(): ShopDashboardSummary {
  return {
    todayGross: 12800,
    monthGross: 356000,
    activeSubscribers: 142,
    pendingCreatorApplications: 3,
  };
}
