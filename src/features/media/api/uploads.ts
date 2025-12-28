// front/src/features/media/api/uploads.ts
import { request } from "@/lib/api";
import type { PostMedia, UploadPostMediaResponse } from "@/shared/types";

function buildMediaForm(files: File[], sampleIndex?: number) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  if (typeof sampleIndex === "number") {
    form.append("sampleIndex", String(sampleIndex));
  }
  return form;
}

/**
 * 複数ファイルを一括アップロード（backend が対応している場合）
 * 返り値: { items: PostMedia[] } を想定
 */
export function uploadPostMediaBatch(
  postId: string,
  files: File[],
  sampleIndex?: number,
): Promise<{ items: PostMedia[] }> {
  return request<{ items: PostMedia[] }>(`/posts/${postId}/media`, {
    method: "POST",
    body: buildMediaForm(files, sampleIndex),
    json: false,
  });
}

/**
 * 単一/複数アップロード（既存の UploadPostMediaResponse を使う版）
 * ※ backend が UploadPostMediaResponse を返してるならこっちが正
 */
export function uploadPostMedia(
  postId: string,
  files: File[],
  sampleIndex?: number,
): Promise<UploadPostMediaResponse> {
  return request<UploadPostMediaResponse>(`/posts/${postId}/media`, {
    method: "POST",
    body: buildMediaForm(files, sampleIndex),
    json: false,
  });
}

/**
 * 複数ファイルを順番にアップロード
 * ※ 現状は uploadPostMedia() が“まとめて投げる”実装なので、
 *   「順次」にするなら1ファイルずつ投げる必要がある。
 */
export async function uploadPostMediaSequential(
  postId: string,
  files: File[],
  sampleIndex?: number,
): Promise<PostMedia[]> {
  const results: PostMedia[] = [];

  for (let i = 0; i < files.length; i++) {
    // sampleIndex は「全体の中のサンプル位置」なら、1ファイルずつなら再計算が必要
    // ここは “最初の1枚だけサンプル” 等の仕様次第で変える
    const res = await uploadPostMediaBatch(postId, [files[i]], sampleIndex);
    results.push(...(res.items ?? []));
  }

  return results;
}
