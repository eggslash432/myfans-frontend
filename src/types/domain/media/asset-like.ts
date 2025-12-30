// front/src/shared/types/domain/media/asset-like.ts
import type { MediaType } from "@/shared";

export type AssetLike = {
  url: string;
  mediaType?: MediaType | string;
  mimeType?: string;
};
