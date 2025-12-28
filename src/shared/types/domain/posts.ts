// front/src/shared/types/posts.ts

import type { AgeRating, MediaType, PublishedStatus, Visibility } from "./prisma";

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
  creator?: { publicName?: string | null };
  planId?: string | null;
  priceJpy?: number | null;
  media?: PostMedia[];
  canView?: boolean;
  canViewMain?: boolean;
  canViewSample?: boolean;
};

export type UiPost = {
  genreId: string;
};

export type PostMedia = {
  id: string;
  postId: string;
  mediaType: MediaType;
  url: string;
  sortOrder?: number;
  isSample?: boolean;
};

export type UploadPostMediaResponse = {
  items: PostMedia[];
  sampleMediaId?: string;
};

export type UploadSetting = {
  maxFileSizeMb: number;
  maxFiles: number;
};

export type CreatePostPayload = {
  title: string;
  body?: string;
  visibility: Visibility;
  planId?: string | null;
  priceJpy?: number | null;
  ageRating?: AgeRating;
  publishedStatus?: PublishedStatus;
  isSample?: boolean;
};

export type PostEditValues = {
  title: string;
  body: string;
  visibility: Visibility;
  priceJpy: number | null;
  publishedStatus: PublishedStatus;
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
  creator?: { publicName?: string | null };
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
  price?: number | null;
  isAccessible?: boolean | null;
  excerpt?: string | null;
  debugFlags?: string;
  visibility?: Visibility;
  creatorName?: string | null;
};

export type PostVisibility = Extract<Visibility, "free" | "plan" | "paid_single">;
export type PostStatus = Extract<PublishedStatus, "draft" | "private" | "published">;

/** 投稿作成/更新の返り値が未確定なら unknown で止める（後で確定可能） */
export type CreatePostResponse = unknown;
export type UpdatePostResponse = unknown;

