// front/src/features/creators/api/public.ts
import { request } from "@/lib/api";
import type { Creator, PostSummary } from "@/types";

export function getCreatorPublicProfile(id: string): Promise<Creator> {
  return request<Creator>(`/creators/${id}`, { method: "GET" });
}

export function getCreatorPosts(creatorId: string): Promise<{ items: PostSummary[] }> {
  return request<{ items: PostSummary[] }>(`/creators/${creatorId}/posts`, { method: "GET" });
}

/**
 * ここが要注意：
 * APIが配列返しなら Creator[]、ラップなら {items: Creator[]} に合わせる
 */
export function listCreators(): Promise<Creator[]> {
  return request<Creator[]>("/creators", { method: "GET" });
}
