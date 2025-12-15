// front/src/pages/posts/postLabels.ts

import type { PostSummary } from "../../shared/types";

export function getPostStatusLabel(p: PostSummary) {
  // 公開状態でまず分ける
  if (p.publishedStatus === "published") return "公開中";
  if (p.publishedStatus === "draft") return "下書き";
  if (p.publishedStatus === 'private') return "非公開";

  // それ以外は「非公開」扱い（unlisted/private等）
  return "非公開";
}
