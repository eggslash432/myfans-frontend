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

export type StartCreatorKycResponse = { url: string };

export type UploadCreatorAvatarResponse = { url: string };