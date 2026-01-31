// front/src/shared/types/domain/posts/payloads.ts
import type { AgeRating, PostPublishedStatus, PostVisibility } from "@/shared";

export type CreatePostPayload = {
  title: string;
  body?: string;
  visibility: PostVisibility;
  planId?: string | null;
  priceJpy?: number | null;
  ageRating?: AgeRating;
  publishedStatus?: PostPublishedStatus;
  isSample?: boolean;

  genreIds?: string[];
};

export type PostEditValues = {
  title: string;
  body: string;
  visibility: PostVisibility;
  priceJpy: number | null;
  publishedStatus: PostPublishedStatus;
};
