// front/src/shared/types/domain/posts/detail.ts
import type { 
  Genre,
  PostMedia, 
  PostPublishedStatus, 
  PostVisibility 
} from "@/shared";

export type PostDetail = {
  id: string;
  title: string;
  body?: string | null;
  visibility: PostVisibility;
  priceJpy?: number | null;
  planId?: string | null;

  publishedStatus: PostPublishedStatus;
  publishedAt?: string | null;
  createdAt: string;

  creatorId?: string | null;
  creator?: { publicName?: string | null };

  media: PostMedia[];

  genres?: Genre[];

  canView?: boolean;
};

export type PostDetailUi = PostDetail & {
  isLocked: boolean;
};
