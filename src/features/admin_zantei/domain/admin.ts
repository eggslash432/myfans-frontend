// front/src/shared/utils/admin.ts
import { 
  type Announcement, 
  type AnnouncementMedia, 
  type AnnouncementEditState 
} from '@/shared';

export function emptyEdit(): AnnouncementEditState {
  return {
    title: "",
    body: "",
    linkUrl: "",
    bannerImageUrl: "",
    bannerMediaId: null, // ✅ 追加
    startsAt: "",
    endsAt: "",
    isEnabled: true,
  };
}

//以下はadminAnnouncements
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

export function pickCreatedId(res: any): number | null {
  // 返却形式が揺れても拾えるように保険
  const candidates = [
    res?.data?.id,
    res?.data?.data?.id,
    res?.data?.item?.id,
    res?.data?.announcement?.id,
    res?.id,
  ];
  const v = candidates.find((x) => typeof x === "number");
  return v ?? null;
}

export function isImage(m: AnnouncementMedia) {
  const t = (m.mediaType ?? "").toLowerCase();
  return t.includes("image");
}