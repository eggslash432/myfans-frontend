// front/src/lib/authz.ts
import type { AdminRole } from "@/shared";

export function isAdminRole(role?: string | null): role is AdminRole {
  return role === "admin" || role === "sub_admin";
}
