// front/src/pages/admin/announcements/announcementUtils.ts
import type { Announcement } from "@/lib/api/adminAnnouncement";

export function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(v: string) {
  if (!v) return null;
  const d = new Date(v); // datetime-local をローカル時刻として解釈
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function isActiveNow(a: Announcement) {
  if (!a.isEnabled) return false;
  const now = Date.now();
  const s = a.startsAt ? new Date(a.startsAt).getTime() : null;
  const e = a.endsAt ? new Date(a.endsAt).getTime() : null;
  if (s && now < s) return false;
  if (e && now > e) return false;
  return true;
}
