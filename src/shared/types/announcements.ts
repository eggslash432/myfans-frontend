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