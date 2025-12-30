//front/src/types/domain/posts/filters.ts
import type { PublishedStatus, Visibility } from "@/shared";

export type VisibilityFilter = "all" | Visibility;
export type PublishedStatusFilter = "all" | PublishedStatus;
