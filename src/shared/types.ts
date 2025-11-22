// src/shared/types.ts

import type { Visibility } from "./prisma-enums";

type PostMedia = {
  id: string;
  mediaType: 'image' | 'video' | 'audio';
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
  role?: 'user' | 'creator' | 'admin'
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

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected';

export type Payout = {
  id: string;
  amountJpy: number;
  payoutStatus: PayoutStatus;
  requestedAt: string;
  paidAt?: string | null;
  note?: string | null;
};