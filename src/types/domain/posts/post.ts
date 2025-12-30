// front/src/shared/types/domain/posts/post.ts
import type { MediaType, Visibility } from "@/shared";
import type { PostMedia } from "./media";

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
