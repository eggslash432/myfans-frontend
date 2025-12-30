// front/src/shared/types/domain/creators/me.ts
import type { KycStatus } from "@/shared/prisma-enums";
import type { CreatorApprovalStatus } from "../../prisma";

export type CreatorMeResponse = {
  /** 後方互換：管理者承認済み = true */
  isCreator: boolean;
  publicName?: string;

  bio?: string | null;
  avatarUrl?: string | null;

  stripeAccountId: string | null;
  stripeKycStatus: KycStatus; 
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
  balanceJpy: number;
};

export type CreatorAnalyticsMeResponse = {
  totalRevenueJpy: number;
  totalSubscribers: number;
};
