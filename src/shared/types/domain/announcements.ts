// front/src/shared/types/announcements.ts

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

export type AnnouncementMedia = {
  id: number;
  url: string;
  mediaType: string; // "image" | "video" など
  sortOrder: number;
};

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