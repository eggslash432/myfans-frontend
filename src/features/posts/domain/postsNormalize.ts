//
import type { PostVisibility, PublishedStatus } from "@/shared";

export function normalizeStatus(s: any): PublishedStatus {
  if (s === "published") return "published";
  if (s === "private") return "private";
  return "draft";
}

export function normalizeVisibility(v: any): PostVisibility {
  if (v === "plan") return "plan";
  if (v === "paid_single") return "paid_single";
  return "free";
}