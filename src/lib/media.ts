// src/lib/media.ts
import type { MediaType } from '../shared/prisma-enums';
import {api} from './api';

export type PostMedia = {
  id: string;
  postId: string;
  mediaType: MediaType;
  url: string;
  sortOrder: number;
};

function guessMediaType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'audio';
}

/**
 * 単一ファイルをアップロード
 */
export async function uploadPostMedia(postId: string, file: File): Promise<PostMedia> {
  const form = new FormData();
  form.append('file', file);
  form.append('mediaType', guessMediaType(file)); // ← バックエンド側DTOに合わせて

  // ★ JSON 版ではなく multipart 版を使う
  return api.postForm<PostMedia>(`/posts/${postId}/media`, form, true);
}

/**
 * 複数ファイルを順番にアップロード
 */
export async function uploadMultiplePostMedia(postId: string, files: File[]): Promise<PostMedia[]> {
  const results: PostMedia[] = [];
  for (const f of files) {
    const m = await uploadPostMedia(postId, f);
    results.push(m);
  }
  return results;
}
