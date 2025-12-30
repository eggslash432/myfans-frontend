// front/src/shared/types/domain/auth/user.ts
import type { Role } from "../../prisma";

export type User = {
  id: string;
  email: string;
  nickname?: string;
  role: Role;
  creatorId?: number | null;
};