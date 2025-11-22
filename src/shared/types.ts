// src/shared/types.ts

import type { KycStatus, MediaType, PaymentStatus, PayoutStatus, PublishedStatus, Role, SubStatus, Visibility } from "./prisma-enums";

type PostMedia = {
  id: string;
  mediaType: MediaType;
  url: string;
  sortOrder?: number;
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
  planId?: string | null;
  priceJpy?: number | null;
  media?: PostMedia[];
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
}

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
};

export type PlansResponse = { ok: true; plans: Plan[] };

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

export type PostSummary = {
  id: string;
  title: string;
  visibility: Visibility;
  priceJpy?: number | null;
  publishedStatus: PublishedStatus;
  publishedAt?: string | null;
  createdAt: string;
  creatorId: string;
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
  creatorId: string;
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

export type CreatorMeResponse = {
  publicName: string;
  stripeKycStatus?: KycStatus | null;
  isListed?: boolean;
  kyc?: {
    status?: KycStatus | null;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    disabledReason?: string | null;
    errors?: string | null;
    fieldsDue?: string | null;
  };
};

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
