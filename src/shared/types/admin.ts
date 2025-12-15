import type { PublishedStatus, Visibility } from "../prisma-enums";

// front/src/shared/types/admin.ts
export type PendingCreator = {
  userId: string;
  email: string;
  publicName: string | null;
  createdAt: string;
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

export type AdminPostReport = {
  id: string;
  reason: string;
  resolved: boolean;
  createdAt: string;
};

export type AdminSummary = {
  salesMonthly: number;
  newUsersMonthly: number;
  reportsPending: number;
};

export type AdminPayout = {
  id: string;
  creatorId: string;
  amountJpy: number;
  payoutStatus: string;
  requestedAt: string;
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


