//front/src/shared/types/media.ts
import type { MediaType } from "@/shared";

export type Asset = {
  id?: string;
  url: string;
  kind?: string;
  mediaType?: string;
  mimeType?: string;
};

export type AssetLike = {
  url: string;
  mimeType?: string;
  kind?: MediaType | string;
  mediaType?: MediaType | string;
};

export type MediaPreview = {
  url: string;
  kind: 'image' | 'video' | 'audio';
  isSample?: boolean;
};