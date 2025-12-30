// front/src/shared/types/domain/announcements/edit.ts
export type AnnouncementEditState = {
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