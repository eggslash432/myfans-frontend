// front/src/pages/admin/announcements/types.ts
export type EditState = {
  id?: number;
  title: string;
  body: string;
  linkUrl: string;
  bannerImageUrl: string;

  // ✅ number に統一（AnnouncementMedia.id が number なので）
  bannerMediaId?: number | null;

  startsAt: string; // datetime-local
  endsAt: string; // datetime-local
  isEnabled: boolean;
};

export function emptyEdit(): EditState {
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
