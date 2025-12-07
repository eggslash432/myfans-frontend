// src/shared/types.ts

import type { ReactNode } from "react";
import type { AgeRating, KycStatus, MediaType, PaymentStatus, PayoutStatus, PublishedStatus, Role, SubStatus, Visibility } from "./prisma-enums";

type PostMedia = {
  id: string;
  mediaType: MediaType;
  url: string;
  sortOrder?: number;
};

// 投稿作成
export type CreatePostPayload = {
  title: string;
  body?: string;
  visibility: Visibility;
  planId?: string | null;
  priceJpy?: number | null;
  ageRating?: AgeRating;
  publishedStatus?: PublishedStatus;
};

// 投稿編集
export type PostEditValues = {
  title: string;
  body: string;
  visibility: Visibility;
  priceJpy: number | null;
  publishedStatus: PublishedStatus;
};

export type PostProps = {
  post: any | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: PostEditValues) => void;
  onAddMedia: (files: FileList) => void;
  onRemoveMedia: (mediaId: string) => void;
};

export type Post = {
  id: string;
  title: string;
  body?: string;
  bodyMd?: string;
  createdAt: string;
  updatedAt: string;
  isPpv: boolean;
  isPlan: boolean;
  visibility: Visibility;
  creatorId: string;
  creator?: { publicName?: string | null }
  planId?: string | null;
  priceJpy?: number | null;
  media?: PostMedia[];
  canView?: boolean; // ★ 追加
};

export type PostSummary = {
  id: string;
  title: string;
  visibility: Visibility;
  priceJpy?: number | null;
  publishedStatus: PublishedStatus;
  publishedAt?: string | null;
  createdAt: string;
  creatorId?: string | null;
  creatorName?: string;
  reportsCount?: number;
};

export type PostDetail = {
  id: string;
  title: string;
  body?: string | null;
  visibility: Visibility;
  priceJpy?: number | null;
  planId?: string | null;
  publishedStatus: PublishedStatus;
  publishedAt?: string | null;
  createdAt: string;
  creatorId?: string | null;
  creator?: {
    publicName?: string | null;
  };
  media: {
    id: string;
    url: string;
    mediaType: MediaType;
    sortOrder: number;
  }[];
  canView?: boolean;
};

export type PostItem = {
  id: string;
  title: string;
  coverUrl?: string | null;
  isFree?: boolean | null;
  price?: number | null;          // 円
  isAccessible?: boolean | null;
  excerpt?: string | null;
  debugFlags?: string;
  visibility?: Visibility;
  creatorName?: string | null;
};

export type CheckoutResponse = {
  url?: string;
  checkoutUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
  pubKey?: string;
  publishableKey?: string;
};

export type User = {
  id: string
  email: string
  nickname?: string
  role?: Role
}

export type Creator = {
  id: string
  name: string
  avatarUrl?: string
  bio?: string
  plans: Plan[];
}

export type CreatorMeResponse = {
  isCreator: boolean;
  publicName: string;

  // プロフィール情報
  bio: string | null;
  avatarUrl: string | null;

  // Stripe / KYC
  stripeAccountId: string | null;
  stripeKycStatus: string | null;         // "approved" | "pending" | "rejected"
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeKycDisabledReason: string | null;
  stripeKycFieldsDue: string[];
  stripeKycErrors: any[];
};

export type Plan = {
  id: string;
  creatorId: string;
  name: string;
  priceJpy: number;
  description?: string | null;
  isActive: boolean;
  externalPriceId?: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  interval? : 'month';
};

export type PlansResponse = { 
  ok: true; 
  plans: Plan[] 
};

// ★ 新規プラン作成
export type CreatePlanPayload = {
  name: string;
  priceJpy: number;
};

export type UpdatePlanPayload = {
  name?: string;
  priceJpy?: number;
  isActive?: boolean;
  description?: string | null;
};

export type Payout = {
  id: string;
  amountJpy: number;
  payoutStatus: PayoutStatus;
  requestedAt: string;
  paidAt?: string | null;
  note?: string | null;
};

export interface Subscription {
  id: string;
  planName: string;
  nextBillingDate?: string | null;
  status: SubStatus;
}

export interface Me {
  id: string;
  nickname?: string | null;
  email: string;
  subscription?: Subscription | null;
}

export interface PaymentRecord {
  id: string;
  amountJpy: number;
  status: PaymentStatus;
  createdAt: string; // ISO
  paidAt?: string | null;
}

export type ReportItem = {
  id: string;
  postId: string;
  postTitle: string;
  creatorName: string;
  reporterId: string;
  reporterEmail: string;
  reason?: string | null;
  status: string;
  createdAt: string;
};

export type AdminSummary = {
  salesMonthly: number;
  newUsersMonthly: number;
  reportsPending: number;
};

export type Props = {
  children: ReactNode;
};

export type Props2 = {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  autoComplete?: string; // "new-password" | "current-password" など
  className?: string;
  inputClassName?: string;
  label?: string;
};

export type PendingCreator = {
  userId: string;
  email: string;
  publicName: string | null;
  createdAt: string;
  stripeKycStatus?: string | null;
};