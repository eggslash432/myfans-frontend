import { request } from "@/lib/api";
import type { AdminPost } from "@/shared";

export function adminListPosts(params?: {
  status?: string;
  creatorId?: string;
}): Promise<AdminPost[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.creatorId) qs.set("creatorId", params.creatorId);
  const q = qs.toString();
  return request<AdminPost[]>(`/admin/posts${q ? `?${q}` : ""}`);
}

/** 投稿削除（返り値を使わないなら void でOK） */
export function adminDeletePost(postId: string): Promise<void> {
  return request<void>(`/admin/posts/${postId}`, { method: "DELETE" });
}

/** 投稿ステータス更新（返り値を使わないなら void） */
export function adminUpdatePostStatus(postId: string, status: string): Promise<void> {
  return request<void>(`/admin/posts/${postId}/status`, {
    method: "PATCH",
    body: { status },
  });
}
