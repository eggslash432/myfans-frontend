// front/src/features/posts/api/legacy.ts
import { apiDelete } from "@/lib/api";
import type { CreatePostPayload, CreatePostResponse, PostDetail, } from "@/types";
import { createPost, getMyPosts } from "./me";
import { getPostDetail } from "./detail";

/** 自分の投稿一覧（旧: getMyPosts / myPosts） */
export { getMyPosts };
export const myPosts = getMyPosts;

/** 単一投稿（旧: getPost） */
export async function getPost(postId: string): Promise<PostDetail> {
  return getPostDetail(postId);
}

/**
 * 旧 createPostSmart
 * - 旧実装では payload を整形して createPost するだけだったので単純ラップ
 */
export function createPostSmart(payload: Partial<CreatePostPayload>): Promise<CreatePostResponse> {
  return createPost(payload as CreatePostPayload);
}

/** 投稿メディア削除（旧: deleteMyPostMedia）
 *  本当は media feature 側へ寄せたいが互換のため残す
 */
export async function deleteMyPostMedia(postId: string, mediaId: string) {
  return apiDelete(`/posts/${postId}/media/${mediaId}`);
}
