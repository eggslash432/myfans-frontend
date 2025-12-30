import type { MediaType } from "@/types";

// front/src/shared/types/domain/media/preview.ts
export type MediaPreview = {
  url: string;
  kind: MediaType;
  isSample?: boolean;
};
