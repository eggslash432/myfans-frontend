// front/src/shared/types/domain/admin/users.ts

import type { AdminRole } from "./roles";

export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  role: AdminRole;
};