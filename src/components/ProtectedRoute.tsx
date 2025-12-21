// front/src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useShopMe } from "../hooks/useShopMe";
import { useCreatorMe } from "../hooks/useCreatorMe";
import type { ReactNode } from "react";
import type { Role } from "../shared/prisma-enums";

type Require = "auth" | "admin" | "shop" | "creator";

type Props = {
  children: ReactNode;

  /** 運営ロール（互換用・将来削除OK） */
  role?: Role;
  roles?: Role[];

  /** 新方式 */
  require?: Require;
};

export default function ProtectedRoute({
  children,
  role,
  roles,
  require,
}: Props) {
  const { user, ready } = useAuth();
  const location = useLocation();

  const shopMe = useShopMe();
  const creatorMe = useCreatorMe();

  if (!ready) return <div className="p-6">読み込み中...</div>;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // ============================
  // ✅ require 判定（新方式）
  // ============================
  if (require) {
    if (require === "auth") return <>{children}</>;

    // 運営（User.role）
    if (require === "admin") {
      if (user.role !== "admin" && user.role !== "sub_admin") {
        return <Navigate to="/" replace />;
      }
      return <>{children}</>;
    }

    // Shop 所属（ShopMember の存在）
    if (require === "shop") {
      if (!shopMe.isSuccess) {
        return <Navigate to="/" replace />;
      }
      return <>{children}</>;
    }

    // Creator（承認済み Creator の存在）
    if (require === "creator") {
      if (
        !creatorMe.isSuccess ||
        creatorMe.data.approvalStatus !== "approved"
      ) {
        return <Navigate to="/" replace />;
      }
      return <>{children}</>;
    }
  }

  // ============================
  // ⚠️ 互換：旧 role / roles 判定
  // （段階的に削除していく）
  // ============================
  const allowedRoles: Role[] | null = roles
    ? roles
    : role
    ? [role]
    : null;

  if (allowedRoles) {
    if (!allowedRoles.includes(user.role as Role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
