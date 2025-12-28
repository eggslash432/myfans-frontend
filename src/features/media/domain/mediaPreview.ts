//
import type { MediaPreview } from "@/shared";


export function recalcIsSample(previews: MediaPreview[], idx: number | null) {
  return previews.map((p, i) => ({ ...p, isSample: idx !== null && i === idx }));
}