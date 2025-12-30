// front/src/shared/types/domain/posts/admin.ts
import type { PublishedStatus, Visibility } from "@/shared";

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
