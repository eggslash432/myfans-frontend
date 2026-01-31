// front/src/shared/types/domain/posts/admin.ts
import type { PostPublishedStatus, PostVisibility } from "@/shared";

export type PostSummary = {
  id: string;
  title: string;
  visibility: PostVisibility;
  priceJpy?: number | null;
  publishedStatus: PostPublishedStatus;
  publishedAt?: string | null;
  createdAt: string;

  creatorId?: string | null;
  creatorName?: string;

  reportsCount?: number;
};
