import type { PublishedStatus, Visibility } from "../prisma-enums";

// front/src/shared/types/admin.ts
export type PendingCreator = {
  userId: string;
  email: string;
  publicName: string | null;
  createdAt: string;
  isListed: boolean;
  stripeKycStatus?: string | null;
};

export type AdminPost = {
  id: string;
  title: string;
  visibility: Visibility;
  priceJpy: number | null;
  publishedStatus: PublishedStatus;
  publishedAt: string | null;
  createdAt: string;
  creatorId: string | null;
  creatorName: string; 
  reportsCount: number;
};

export type AdminSummary = {
  salesMonthly: number;
  newUsersMonthly: number;
  reportsPending: number;
};

export type AdminPayout = {
  id: string;

  // 出金対象
  targetType: 'CREATOR' | 'SHOP';

  // 金額・状態
  amountJpy: number;
  
  payoutStatus: 'requested' | 'approved' | 'paid' | 'rejected';

  // 日時
  requestedAt: string;
  paidAt?: string | null;

  // CREATOR 出金用
  creatorId?: string | null;
  creator?: {
    userId: string;
    publicName: string;
  } | null;

  // SHOP 出金用
  shopId?: string | null;
  shop?: {
    id: string;
    name: string;
  } | null;

  // 管理メモ
  note?: string | null;
};


export type AdminReport = {
  id: string;
  status?: string;
  resolved?: boolean;
  reason?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type FeeSettings = {
  managerPercent: number;
  shopPercent: number;
  creatorPercent: number;
};

export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "admin" | "sub_admin";
};

export type ResolveResult = { 
  ok?: boolean; 
  [key: string]: unknown 
};

export type ApprovePayoutResult = { 
  transferId?: string; 
  [key: string]: unknown 
};

export type ListItems<T> = { 
  items: T[] 
};


