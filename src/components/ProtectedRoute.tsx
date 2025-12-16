// front/src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import type { Role } from "../shared/prisma-enums";

type Require = "auth" | "admin" | "shop" | "creator";

type Props = {
  children: ReactNode;

  // 既存
  role?: Role;
  roles?: Role[];

  // 追加
  require?: Require;
};

const REQUIRE_TO_ROLES: Record<Exclude<Require, "auth">, Role[]> = {
  admin: ["admin", "sub_admin"],
  shop: ["shop_admin", "shop_staff"],
  creator: ["creator"],
};

export default function ProtectedRoute({ children, role, roles, require }: Props) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return <div className="p-6">読み込み中...</div>;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // ✅ require があれば require を優先
  if (require) {
    if (require === "auth") return <>{children}</>;

    const allowed = REQUIRE_TO_ROLES[require];
    const userRole = user.role as Role | undefined;

    if (!userRole || !allowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // ✅ 既存 role/roles 判定（互換維持）
  const allowedRoles: Role[] | null = roles ? roles : role ? [role] : null;

  if (allowedRoles) {
    const userRole = user.role as Role | undefined;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
