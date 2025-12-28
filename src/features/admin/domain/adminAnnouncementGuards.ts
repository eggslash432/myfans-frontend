//

import type { Announcement, AnnouncementMedia } from "@/shared";

export function isActiveNow(a: Announcement) {
  if (!a.isEnabled) return false;
  const now = Date.now();
  const s = a.startsAt ? new Date(a.startsAt).getTime() : null;
  const e = a.endsAt ? new Date(a.endsAt).getTime() : null;
  if (s && now < s) return false;
  if (e && now > e) return false;
  return true;
}

export function isImage(m: AnnouncementMedia) {
  const t = (m.mediaType ?? "").toLowerCase();
  return t.includes("image");
}
