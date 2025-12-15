// front/src/shred/postLabels.ts

import type { PostSummary } from "./types";
import type { Visibility } from "./prisma-enums";

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

/** UI表示用（状態＋公開範囲） */
export function postStatusText(p: Pick<PostSummary, "publishedStatus" | "visibility">): string {
  const s = statusLabel(p);
  const v = visibilityLabel(p.visibility);
  return v ? `${s}・${v}` : s;
}
