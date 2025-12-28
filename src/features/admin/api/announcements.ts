import { request } from "@/lib/api";
import type { Announcement } from "@/shared";

export type AdminListAnnouncementsRes = { items: Announcement[] };
export type AdminUpsertAnnouncementRes = { item: Announcement };
export type AdminDeleteAnnouncementRes = { ok: boolean };

export function adminListAnnouncements(): Promise<AdminListAnnouncementsRes> {
  return request<AdminListAnnouncementsRes>("/admin/announcements", { method: "GET" });
}

export function adminCreateAnnouncement(input: {
  title: string;
  body: string;
  linkUrl?: string | null;
  bannerImageUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isEnabled?: boolean;
}): Promise<AdminUpsertAnnouncementRes> {
  return request<AdminUpsertAnnouncementRes>("/admin/announcements", {
    method: "POST",
    body: input,
  });
}

export function adminUpdateAnnouncement(
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
): Promise<AdminUpsertAnnouncementRes> {
  return request<AdminUpsertAnnouncementRes>(`/admin/announcements/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function adminDeleteAnnouncement(id: number): Promise<AdminDeleteAnnouncementRes> {
  return request<AdminDeleteAnnouncementRes>(`/admin/announcements/${id}`, {
    method: "DELETE",
  });
}
