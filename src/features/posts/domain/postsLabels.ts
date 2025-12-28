//
import type { PostSummary, PostVisibility, PublishedStatus, Visibility } from "@/shared";

export function getPostStatusLabel(publishedStatus: PublishedStatus) {
  if (publishedStatus === "published") return "公開";
  if (publishedStatus === "private") return "非公開";
  if (publishedStatus === "draft") return "下書き";
  return "下書き";
}

export function postStatusLabel(s?: string | null) {
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
  const s = getPostStatusLabel(p.publishedStatus);
  const v = visibilityLabel(p.visibility);
  return v ? `${s}・${v}` : s;
}