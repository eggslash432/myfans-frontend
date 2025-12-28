// front/src/shred/postLabels.ts
import type { 
  AdminPost,
  PostStatus,
  PostSummary,
  PostVisibility,
  Visibility,
} from '@/shared';

/** 公開状態ラベル */
export function statusLabel(p: Pick<PostSummary, "publishedStatus">): string {
  switch (p.publishedStatus) {
    case "published":
      return "公開中";
    case "draft":
      return "下書き";
    case "private":
      return "非公開";
    default:
      return "非公開";
  }
}

export function statusLabel2(s: PostStatus) {
  if (s === "published") return "公開";
  if (s === "private") return "非公開";
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
  const s = statusLabel(p);
  const v = visibilityLabel(p.visibility);
  return v ? `${s}・${v}` : s;
}

export function getPostStatusLabel(p: PostSummary) {
  // 公開状態でまず分ける
  if (p.publishedStatus === "published") return "公開中";
  if (p.publishedStatus === "draft") return "下書き";
  if (p.publishedStatus === 'private') return "非公開";

  // それ以外は「非公開」扱い（unlisted/private等）
  return "非公開";
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

export function normalizeStatus(s: any): PostStatus {
  if (s === "published") return "published";
  if (s === "private") return "private";
  return "draft";
}

export function normalizeVisibility(v: any): PostVisibility {
  if (v === "plan") return "plan";
  if (v === "paid_single") return "paid_single";
  return "free";
}

