// front/src/hooks/useGenresData.ts

import { useMemo } from "react";
import type { Genre } from "@/shared";

export function useGenresData() {
  // 今は Home と同じ固定ジャンルでOK
  // 後で API に差し替えやすい
  const genres: Genre[] = useMemo(
    () => [
      { id: "zatsudan", name: "雑談", count: 0 },
      { id: "photo", name: "写真", count: 0 },
      { id: "movie", name: "動画", count: 0 },
      { id: "voice", name: "音声", count: 0 },
    ],
    [],
  );

  return { genres };
}
