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
  id: string
  title: string
  price: number // 円
  interval: 'month' | 'year'
  creatorId: string
}