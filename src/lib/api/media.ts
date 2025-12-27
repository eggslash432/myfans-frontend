// front/src/lib/api/media.ts

import type { PostMedia, UploadPostMediaResponse } from "../../shared/types";
import { request } from "./apiClient";

/**
 * 単一ファイルをアップロード
 */
export function uploadPostMedia(
  postId: string,
  files: File[],
  sampleIndex?: number,
): Promise<UploadPostMediaResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  if (typeof sampleIndex === "number") {
    formData.append("sampleIndex", String(sampleIndex));
  }

  return request<UploadPostMediaResponse>(`/posts/${postId}/media`, {
    method: "POST",
    body: formData,
    json: false,
  });
}

export function deletePostMedia(postId: string, mediaId: string) {
  return request<{ ok: true }>(`/posts/${postId}/media/${mediaId}`, {
    method: "DELETE",
  });
}

/**
 * 複数ファイルを一括アップロード（backend が対応している場合）
 */
export function uploadPostMediaBatch(
  postId: string,
  files: File[],
  sampleIndex?: number,
): Promise<{ items: PostMedia[] }> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  if (typeof sampleIndex === "number") {
    form.append("sampleIndex", String(sampleIndex));
  }

  return request<{ items: PostMedia[] }>(`/posts/${postId}/media`, {
    method: "POST",
    body: form,
    json: false,
  });
}

/**
 * 複数ファイルを順番にアップロード（単発APIを連続で叩く）
 */
export async function uploadPostMediaSequential(
  postId: string,
  files: File[],
  sampleIndex?: number,
): Promise<PostMedia[]> {
  const res = await uploadPostMedia(postId, files, sampleIndex);
  return res.items ?? [];
}
