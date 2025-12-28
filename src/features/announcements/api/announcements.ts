// front/src/lib/api/announcements.ts
import { apiGet } from "@/lib/api";
import type { Announcement } from "@/shared";

export type ActiveAnnouncementsRes = { items: Announcement[] };

export async function getActiveAnnouncements() {
  return apiGet<ActiveAnnouncementsRes>("/announcements/active");
}
