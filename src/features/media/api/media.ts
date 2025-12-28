// front/src/features/media/api/media.ts
import { request } from "@/lib/api";

export function deletePostMedia(postId: string, mediaId: string): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/posts/${postId}/media/${mediaId}`, {
    method: "DELETE",
  });
}
