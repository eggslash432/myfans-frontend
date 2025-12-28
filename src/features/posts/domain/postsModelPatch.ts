// front/src/features/posts/domain/postsModelPatch.ts
import type {
  PostDetail,
  PostDetailUi,
} from "@/shared";

/**
 * API由来の PostDetail を UI用モデルに変換
 * UI派生状態（isLocked）はここでのみ付与する
 */
export function toPostDetailUi(p: PostDetail): PostDetailUi {
  const isLocked =
    p.visibility !== "free" && p.canView !== true;

  return {
    ...p,
    isLocked,
  };
}

/**
 * APIレスポンスの正規化（事実データのみ）
 * UI派生プロパティは絶対に触らない
 */
export function normalizePostDetail(raw: PostDetail): PostDetail {
  if (raw.visibility === "free") {
    return {
      ...raw,
      canView: true,
    };
  }
  return raw;
}
