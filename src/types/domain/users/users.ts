//front/src/shared/types/domain/users.ts

export type PickUser = {
  id: string;
  email: string;
  displayName?: string | null;
  role?: string | null;
};
