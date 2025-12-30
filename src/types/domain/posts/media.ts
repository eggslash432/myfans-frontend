// front/src/shared/types/domain/posts/media.ts
import type { MediaType } from "@/shared";

export type PostMedia = {
  id: string;
  postId: string;
  mediaType: MediaType;
  url: string;
  sortOrder?: number;
  isSample?: boolean;
};

export type UploadPostMediaResponse = {
  items: PostMedia[];
  sampleMediaId?: string;
};

export type UploadSetting = {
  maxFileSizeMb: number;
  maxFiles: number;
};
