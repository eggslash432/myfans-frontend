// front/src/features/posts/api/actions.ts
import { request } from "@/lib/api";

export function reportPost(
  postId: string,
  input?: { reason?: string; detail?: string } | null,
): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/posts/${postId}/report`, {
    method: "POST",
    body: input ?? {},
  });
}
