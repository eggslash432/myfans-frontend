// front/src/lib/api/posts.ts

import { apiDelete, request } from '@/lib/api';
import { normalizePostDetail } from '../domain/post';
import type {
  PostSummary,
  PostDetail,
  CreatePostPayload,
  PostEditValues,
  ListResponse,
  CreatePostResponse,
  UpdatePostResponse,
  PostItem,  
} from '@/shared/types';

export function getPublicPosts(): Promise<ListResponse<PostSummary>> {
  return request<ListResponse<PostSummary>>('/posts', { method: 'GET' });
}

export async function getPostDetail(postId: string): Promise<PostDetail> {
  const data = await request<PostDetail>(`/posts/${postId}`, { method: 'GET' });
  return normalizePostDetail(data);
}

export function createPost(payload: CreatePostPayload): Promise<CreatePostResponse> {
  return request<CreatePostResponse>('/posts', {
    method: 'POST',
    body: payload,
  });
}

export function updateMyPost(
  postId: string,
  payload: PostEditValues,
): Promise<UpdatePostResponse> {
  const body = {
    title: payload.title,
    body: payload.body,
    visibility: payload.visibility,
    priceJpy: payload.priceJpy ?? null,
    publishedStatus: payload.publishedStatus,
    // ✅ genreId は送らない（DTOに無いので弾かれる）
  };

  return request<UpdatePostResponse>(`/posts/me/${postId}`, {
    method: 'PATCH',
    body,
  });
}

// ==============================
// 後方互換（api_old.ts）
// ==============================

/** 自分の投稿一覧（旧: getMyPosts / myPosts） */
export function getMyPosts(): Promise<ListResponse<PostSummary>> {
  return request<ListResponse<PostSummary>>('/posts/me', { method: 'GET' });
}
export const myPosts = getMyPosts;

/** 単一投稿（旧: getPost） */
export async function getPost(postId: string): Promise<PostDetail> {
  return getPostDetail(postId);
}

/**
 * 旧 createPostSmart
 * - 旧実装では payload を整形して createPost するだけだったので、ここでは単純ラップ
 */
export function createPostSmart(
  payload: Partial<CreatePostPayload>,
): Promise<CreatePostResponse> {
  return createPost(payload as CreatePostPayload);
}

export async function deleteMyPostMedia(postId: string, mediaId: string) {
  return apiDelete(`/posts/${postId}/media/${mediaId}`);
}

/** 投稿通報（旧: reportPost） */
export function reportPost(
  postId: string,
  input?: { reason?: string; detail?: string } | null,
): Promise<{ ok: true }> {
  return request<{ ok: true }>(`/posts/${postId}/report`, {
    method: 'POST',
    body: input ?? {},
  });
}

export function getOfficialPosts() {
  return request<ListResponse<PostSummary>>('/posts?official=1', { method: 'GET' });
}

export async function listPostsByGenre(genreId: string) {
  return request<{ items: PostItem[] }>(
    `/posts/by-genre/${genreId}`,
    { method: "GET" },
  ).then((res) => res.items);
}
