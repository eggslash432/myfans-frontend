// front/src/lib/media.ts

import type { MediaType } from "../../shared/prisma-enums";
import type { PostMedia } from "../../shared/types";
import { request } from "./apiClient";

function guessMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "audio";
}

/**
 * 単一ファイルをアップロード
 * - FormData のときは json:false が必須（Content-Type はブラウザに任せる）
 */
export async function uploadPostMedia(
  postId: string,
  file: File,
): Promise<PostMedia> {
  const form = new FormData();

  form.append("mediaType", guessMediaType(file));

  return await request<PostMedia>(`/posts/${postId}/media`, {
    method: "POST",
    body: form,
    json: false, // Content-Type を付けない（ブラウザに任せる）
  });
}

/**
 * 複数ファイルを順番にアップロード（単発APIを連続で叩く方式）
 */
export async function uploadMultiplePostMedia(
  postId: string,
  files: File[],
): Promise<PostMedia[]> {
  const results: PostMedia[] = [];
  for (const f of files) {
    results.push(await uploadPostMedia(postId, f));
  }
  return results;
}

/**
 * 複数ファイルを一括アップロード（バックエンドが複数対応している場合のみ）
 * - もし backend が /posts/:id/media で files を受けて items を返す実装ならこれが速い
 */
export async function uploadPostMediaBatch(
  postId: string,
  files: File[],
): Promise<PostMedia[]> {
  const form = new FormData();
  for (const f of files) {
    form.append("files", f);
  }

  const data = await request<{ items: PostMedia[] }>(`/posts/${postId}/media`, {
    method: "POST",
    body: form,
    json: false,
  });

  // backend が {items:[...]} の形のとき
  return data?.items ?? [];
}
