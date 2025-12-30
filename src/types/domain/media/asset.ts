import type { MediaType } from "@/types";

// front/src/shared/types/domain/media/asset.ts
export type Asset = {
  id?: string;
  url: string;

  mediaType?: MediaType; 
  mimeType?: string;
};
