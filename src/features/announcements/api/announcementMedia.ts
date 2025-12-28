// front/src/features/announcements/api/announcementMedia.ts
import { request } from "@/lib/api";
import type { AnnouncementMedia } from "@/shared";

export function uploadAnnouncementMedia(announcementId: number, files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return request<{ items: AnnouncementMedia[] }>(
    `/admin/announcements/${announcementId}/media`,
    { method: "POST", body: form, json: false },
  );
}

// ✅ 追加：一覧取得
export function listAnnouncementMedia(announcementId: number) {
  return request<{ items: AnnouncementMedia[] }>(
    `/admin/announcements/${announcementId}/media`,
    { method: "GET" },
  );
}

// （任意）削除も欲しいなら
export function deleteAnnouncementMedia(announcementId: number, mediaId: number) {
  return request<void>(
    `/admin/announcements/${announcementId}/media/${mediaId}`,
    { method: "DELETE" },
  );
}
