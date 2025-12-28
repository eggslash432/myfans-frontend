// front/src/shared/types/creators.ts
import type { CreatorApprovalStatus } from "../prisma-enums";
import type { Plan } from "./plans";

export type Creator = {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  plans: Plan[];
};

export type UiCreator = {
  id: string;
  avatarUrl: string | null;
  displayName: string;
  initial: string;
  bio: string;
  postCount: number;
  fanCount: number;
};

// 申請用（管理画面）
export type CreatorApplication = {
  userId: string;
  email: string;
  displayName: string | null;
  publicName: string;
  createdAt: string;
  updatedAt: string;

  approvalStatus: CreatorApprovalStatus;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectReason?: string | null;

  // ③の履歴用（あとで追加）
  applicationCount?: number;
  lastAppliedAt?: string | null;
};

export type CreatorMeResponse = {
  /**
   * ★ 後方互換
   * 管理者承認済み = true
   */  
  isCreator: boolean;
  publicName?: string;

  // プロフィール情報
  bio?: string | null;
  avatarUrl?: string | null;

  // Stripe / KYC
  stripeAccountId: string | null;
  stripeKycStatus: string | null; // "approved" | "pending" | "rejected"
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeKycDisabledReason: string | null;
  stripeKycFieldsDue: string[];
  stripeKycErrors: any[];

  approvalStatus: CreatorApprovalStatus;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  rejectReason?: string | null;  
};

export type CreatorPayoutBalanceResponse = { 
  balanceJpy: number 
};

export type CreatorAnalyticsMeResponse = {
  totalRevenueJpy: number;
  totalSubscribers: number;
};

export type UpdateCreatorProfileInput = {
  publicName?: string;
  bio?: string;
  avatarUrl?: string;
};

export const creatorMenuItems = [
  { label: '投稿管理', description: '投稿の一覧・編集・公開設定', path: '/creators/posts', icon: '📝' },
  { label: 'プラン設定', description: '月額プランの作成・編集', path: '/creators/plans', icon: '📦' },
  { label: '出金管理', description: '売上の振込口座・出金履歴', path: '/creators/payouts', icon: '💰' },
  { label: '売上レポート', description: '期間別の売上・購読状況', path: '/creators/analytics', icon: '📊' },
] as const;

export type StartCreatorKycResponse = { url: string };

export type UploadCreatorAvatarResponse = { url: string };


//analytics
export type SimpleSummary = {
  totalRevenueJpy: number;
  totalSubscribers: number;
};

export type RevenueTrendPoint = {
  date: string; // "2025-12-01" or "2025-12"
  revenueJpy: number;
};

export type PostRevenueRow = {
  postId: string;
  title: string;
  revenueJpy: number;
  buyers: number;
};

export type SubscriberTrendPoint = {
  date: string; // "2025-12-01" or "2025-12"
  newSubs: number;
  canceledSubs: number;
  net: number;
};