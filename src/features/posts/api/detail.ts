// front/src/features/posts/api/detail.ts
import { request } from "@/lib/api";
import type { PostDetail } from "@/types";
import { normalizePostDetail } from "../domain";

export async function getPostDetail(postId: string): Promise<PostDetail> {
  const data = await request<PostDetail>(`/posts/${postId}`, { method: "GET" });
  return normalizePostDetail(data);
}
