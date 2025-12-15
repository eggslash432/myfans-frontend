// front/src/shared/types/creators.ts
import type { Plan } from "./plans";

export type Creator = {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  plans: Plan[];
};

export type CreatorMeResponse = {
  isCreator: boolean;
  publicName: string;

  // プロフィール情報
  bio: string | null;
  avatarUrl: string | null;

  // Stripe / KYC
  stripeAccountId: string | null;
  stripeKycStatus: string | null; // "approved" | "pending" | "rejected"
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeKycDisabledReason: string | null;
  stripeKycFieldsDue: string[];
  stripeKycErrors: any[];
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