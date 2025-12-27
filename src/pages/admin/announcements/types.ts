// front/src/pages/admin/announcements/types.ts
export type EditState = {
  id?: number;
  title: string;
  body: string;
  linkUrl: string;
  bannerImageUrl: string;
  startsAt: string; // datetime-local
  endsAt: string; // datetime-local
  isEnabled: boolean;
};

export function emptyEdit(): EditState {
  return {
    title: "",
    body: "",
    linkUrl: "",
    bannerImageUrl: "",
    startsAt: "",
    endsAt: "",
    isEnabled: true,
  };
}
