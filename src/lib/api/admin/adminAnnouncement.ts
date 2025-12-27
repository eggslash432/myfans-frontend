// front/src/lib/api/adminAnnouncement.ts
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  linkUrl: string | null;
  bannerImageUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

// API返却が { items } / { item } / { ok } の想定
export type AdminListAnnouncementsRes = { items: Announcement[] };
export type AdminUpsertAnnouncementRes = { item: Announcement };
export type AdminDeleteAnnouncementRes = { ok: boolean };

export async function adminListAnnouncements() {
  // apiGet<T>() は Promise<{ data: T }>
  return apiGet<AdminListAnnouncementsRes>("/admin/announcements");
}

export async function adminCreateAnnouncement(input: {
  title: string;
  body: string;
  linkUrl?: string | null;
  bannerImageUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isEnabled?: boolean;
}) {
  return apiPost<AdminUpsertAnnouncementRes>("/admin/announcements", input);
}

export async function adminUpdateAnnouncement(
  id: number,
  input: Partial<{
    title: string;
    body: string;
    linkUrl: string | null;
    bannerImageUrl: string | null;
    startsAt: string | null;
    endsAt: string | null;
    isEnabled: boolean;
  }>,
) {
  return apiPatch<AdminUpsertAnnouncementRes>(`/admin/announcements/${id}`, input);
}

export async function adminDeleteAnnouncement(id: number) {
  return apiDelete<AdminDeleteAnnouncementRes>(`/admin/announcements/${id}`);
}
