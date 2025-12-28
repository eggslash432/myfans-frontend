//front/src/shared/utils/posts.ts

import type { 
  AdminPost, 
  PostSummary, 
  PostVisibility, 
  PublishedStatus, 
  Visibility 
} from "../types";

export function unwrapPost(post: any) {
  return post?.data ?? post?.post ?? post;
}

export function toArrayUploaded(res: any): any[] {
  // uploadPostMedia の戻りがブレても吸収
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  return [res];
}

export function getPostStatusLabel(publishedStatus: PublishedStatus) {
  if (publishedStatus === "published") return "公開";
  if (publishedStatus === "private") return "非公開";
  if (publishedStatus === "draft") return "下書き";
  return "下書き";
}

/** 公開範囲ラベル */
export function visibilityLabel(
  v: Visibility | null | undefined,
): string {
  switch (v) {
    case "free":
      return "無料";
    case "plan":
      return "プラン限定";
    case "paid_single":
      return "単品購入";
    default:
      return "";
  }
}

export function visibilityLabel2(v: PostVisibility) {
  if (v === "plan") return "プラン";
  if (v === "paid_single") return "PPV";
  return "無料";
}

/** UI表示用（状態＋公開範囲） */
export function postStatusText(p: Pick<PostSummary, "publishedStatus" | "visibility">): string {
  const s = getPostStatusLabel(p.publishedStatus);
  const v = visibilityLabel(p.visibility);
  return v ? `${s}・${v}` : s;
}

// StatusBadge に渡す “合成status”
export function toPostBadgeStatus(p: AdminPost): string {
  const st = normalizeStatus((p as any).publishedStatus);
  const vis = normalizeVisibility((p as any).visibility);
  return `${st}:${vis}`; // 例: "published:plan"
}

export function postStatusLabel(s?: string | null) {
  if (s === "published") return "公開";
  if (s === "private") return "非公開";
  return "下書き";
}

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