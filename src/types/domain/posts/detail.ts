// front/src/shared/types/domain/posts/detail.ts
import type { 
  PostMedia, 
  PublishedStatus, 
  Visibility 
} from "@/shared";

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

  media: PostMedia[];

  canView?: boolean;
};

export type PostDetailUi = PostDetail & {
  isLocked: boolean;
};
