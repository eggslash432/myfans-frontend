//front/src/shared/types/users.ts

export type SelectedUser = {
  id: string;
  email: string;
  displayName?: string | null;
};

export type PickUser = {
  id: string;
  email: string;
  displayName?: string | null;
  role?: string | null;
};