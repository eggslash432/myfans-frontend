// front/src/shared/types/domain/posts/payloads.ts
import type { AgeRating, PublishedStatus, Visibility } from "@/shared";

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
