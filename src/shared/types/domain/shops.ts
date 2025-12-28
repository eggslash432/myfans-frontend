// front/src/shared/types/shops.ts

import type { ShopMemberRole } from "../prisma";

export type ShopRole = "owner" | "admin" | "staff";

export type ShopCreatorApplicationStatus = "pending" | "approved" | "rejected";

export type ShopSalesRange = "today" | "month" | "all";

export type ShopMe = {
  shopId: string;
  role: ShopMemberRole;
};

export type ShopDashboardSummary = {
  todayGross: number;
  monthGross: number;
  activeSubscribers: number;
  pendingCreatorApplications: number;
};

export type ShopCreatorApplication = {
  id: string;
  userId: string;
  publicName: string;
  email: string;
  status: ShopCreatorApplicationStatus;
  createdAt: string;
  rejectReason?: string | null;
};

export type ShopCreatorApplicationsRes = {
  items: ShopCreatorApplication[];
  nextCursor: string | null;
};

export type ShopSalesSummary = {
  range: ShopSalesRange;
  gross: number; // 総売上
  platformFee: number; // 手数料
  net: number; // 入金対象
  transactions: number; // 取引数
};

export type ShopInvite = {
  code: string;
  role: ShopMemberRole;
  expiresAt?: string | null;
};