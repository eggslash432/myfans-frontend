// front/src/features/posts/api/public.ts
import { request } from "@/lib/api";
import type { ListResponse, PostSummary, PostItem } from "@/shared/types";

export function getPublicPosts(): Promise<ListResponse<PostSummary>> {
  return request<ListResponse<PostSummary>>("/posts", { method: "GET" });
}

export function getOfficialPosts(): Promise<ListResponse<PostSummary>> {
  return request<ListResponse<PostSummary>>("/posts?official=1", { method: "GET" });
}

export async function listPostsByGenre(genreId: string): Promise<PostItem[]> {
  const res = await request<{ items: PostItem[] }>(`/posts/by-genre/${genreId}`, { method: "GET" });
  return res.items ?? [];
}
