// front/src/shared/types/domain/announcements/media.ts

import type { MediaType } from "@/shared/prisma-enums";

export type AnnouncementMedia = {
  id: number;
  url: string;
  mediaType: MediaType; // "image" | "video" など
  sortOrder: number;
};