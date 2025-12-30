// front/src/shared/types/domain/me/me.ts
import type { Role } from "../../prisma";

export type Me = {
  id: string;
  email: string;
  role: Role;
};
