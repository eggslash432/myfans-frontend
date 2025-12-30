// front/src/shared/types/domain/creators/ui.ts
export type UiCreator = {
  id: string;
  avatarUrl: string | null;
  displayName: string;
  initial: string;
  bio: string;
  postCount: number;
  fanCount: number;
};
