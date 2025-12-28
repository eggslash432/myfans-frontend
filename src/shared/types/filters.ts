// front/src/shared/types/filters.ts
import {
  type PostVisibility,
  type PostStatus,
  type CreatorApprovalStatus,
} from '@/shared';

// フィルタUI側（"all" を含む）
export type VisibilityFilter = "all" | PostVisibility;

export type StatusFilter = "all" | PostStatus;

export type CreatorApprovalStatusFilter = CreatorApprovalStatus | "all";

export type SortKey =
  | "createdAt"
  | "publishedAt"
  | "title"
  | "reportsCount"
  | "creatorName"
  | "status";