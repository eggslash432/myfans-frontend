// front/src/lib/authz.ts

export type AdminRole = "admin" | "sub_admin";

/**
 * User.role は "admin" | "sub_admin" | null(一般ユーザー) 前提
 * ※APIの設計（roleは運営のみ）に合わせる
 */
export function isAdminRole(role?: string | null): role is AdminRole {
  return role === "admin" || role === "sub_admin";
}
