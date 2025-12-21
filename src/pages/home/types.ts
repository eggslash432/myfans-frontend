// front/src/pages/home/types.ts

export type UiCreator = {
  id: string;
  avatarUrl: string | null;
  displayName: string;
  initial: string;
  bio: string;
  postCount: number;
  fanCount: number;
};


export type UiPost = {
  genreId: string;
};

export type UiAdminPost = {
  id: string;
  title: string;
  body: string;
  dateStr: string;
};

export type Genre = {
  id: string;
  name: string;
  count: number;
};