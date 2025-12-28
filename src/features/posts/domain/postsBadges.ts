//

import type { AdminPost } from "@/shared";
import { normalizeStatus, normalizeVisibility } from "./postsNormalize";

// StatusBadge に渡す “合成status”
export function toPostBadgeStatus(p: AdminPost): string {
  const st = normalizeStatus((p as any).publishedStatus);
  const vis = normalizeVisibility((p as any).visibility);
  return `${st}:${vis}`; // 例: "published:plan"
}