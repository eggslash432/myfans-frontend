// front/src/shared/types/admin.ts
import type { 
  NotificationSource,
  NotificationType,
  PublishedStatus, 
  Visibility 
} from "../prisma";

export type AdminRole = "admin" | "sub_admin";

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

export type UiAdminPost = {
  id: string;
  title: string;
  body: string;
  dateStr: string;
};

export type AdminSummary = {
  salesMonthly: number;
  newUsersMonthly: number;
  reportsPending: number;
};

export type AdminNotifRow = {
  id: string;
  userId: string;
  type: NotificationType;
  source: NotificationSource | null;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type AdminNotifListParams = {
  userId?: string;
  type?: NotificationType;
  source?: NotificationSource;
  unreadOnly?: boolean;
  take: number;
  skip: number;
};

export type AdminNotifListRes = {
  items: AdminNotifRow[];
  total?: number;
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
  updatedAt?: string;
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

export type AdminCreateShopRes = {
  ok: true;
  shop: { id: string; name: string };
};

export type AdminSalesBreakdown = {
  month: string; // YYYY-MM
  // 支払総額（paid）
  grossAmountJpy: number;

  // 分配（Paymentスナップショット集計）
  platformAmountJpy: number;
  shopAmountJpy: number;
  creatorAmountJpy: number;

  // 任意（あれば）
  stripeFeeJpy?: number;

  // 件数
  paidCount: number;
};

export type AdminPaymentRow = {
  id: string;
  paidAt: string | null;
  amountJpy: number;

  // スナップショット
  platformAmountJpy: number | null;
  shopAmountJpy: number | null;
  creatorAmountJpy: number | null;
  stripeFeeJpy: number | null;

  // 紐づけ
  creatorId: string | null; // ※現状は creator.userId 想定
  shopId: string | null;

  externalTxId: string | null;
};




