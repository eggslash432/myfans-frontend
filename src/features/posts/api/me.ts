// front/src/features/posts/api/me.ts
import { request } from "@/lib/api";
import type {
  CreatePostPayload,
  CreatePostResponse,
  ListResponse,
  PostEditValues,
  PostSummary,
  UpdatePostResponse,
} from "@/shared/types";

export function getMyPosts(): Promise<ListResponse<PostSummary>> {
  return request<ListResponse<PostSummary>>("/posts/me", { method: "GET" });
}

export function createPost(payload: CreatePostPayload): Promise<CreatePostResponse> {
  return request<CreatePostResponse>("/posts", {
    method: "POST",
    body: payload,
  });
}

export function updateMyPost(postId: string, payload: PostEditValues): Promise<UpdatePostResponse> {
  const body = {
    title: payload.title,
    body: payload.body,
    visibility: payload.visibility,
    priceJpy: payload.priceJpy ?? null,
    publishedStatus: payload.publishedStatus,
    // ✅ genreId は送らない（DTOに無いので弾かれる）
  };

  return request<UpdatePostResponse>(`/posts/me/${postId}`, {
    method: "PATCH",
    body,
  });
}
