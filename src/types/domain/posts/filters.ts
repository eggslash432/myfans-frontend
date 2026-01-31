//front/src/types/domain/posts/filters.ts
import type { PostPublishedStatus, PostVisibility } from "@/shared";

export type VisibilityFilter = "all" | PostVisibility;
export type PublishedStatusFilter = "all" | PostPublishedStatus;
