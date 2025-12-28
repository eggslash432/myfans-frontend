//

import type { AnnouncementEditState } from "@/shared";

export function emptyEdit(): AnnouncementEditState {
  return {
    title: "",
    body: "",
    linkUrl: "",
    bannerImageUrl: "",
    bannerMediaId: null, // ✅ 追加
    startsAt: "",
    endsAt: "",
    isEnabled: true,
  };
}