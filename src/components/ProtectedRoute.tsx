// front/src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShopMe } from "@/hooks/useShopMe";
import { useCreatorMe } from "@/hooks/useCreatorMe";
import type { ReactNode } from "react";
import type { Role } from "@/shared/prisma-enums"; // ✅ 型は type import のまま

type Require = "auth" | "admin" | "shop" | "creator";

type Props = {
  children: ReactNode;

  /** 互換（旧方式） */
  role?: Role;
  roles?: Role[];

  /** 新方式 */
  require?: Require;
};

export default function ProtectedRoute({ children, role, roles, require }: Props) {
  const { user, ready } = useAuth();
  const location = useLocation();

  const shopMe = useShopMe({ enabled: require === "shop" });
  const creatorMe = useCreatorMe({ enabled: require === "creator" });

  if (!ready) return <div className="p-6">読み込み中...</div>;

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // ============================
  // ✅ require 判定（新方式）
  // ============================
  if (require === "auth") return <>{children}</>;

  if (require === "admin") {
    // ✅ Role は型しか無いので、文字列で判定する
    const r = String(user.role ?? "");
    if (r !== "admin" && r !== "sub_admin") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  if (require === "shop") {
    if (shopMe.isLoading) return <div className="p-6">読み込み中...</div>;
    if (!shopMe.isSuccess) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  if (require === "creator") {
    if (creatorMe.isLoading || (creatorMe as any).isFetching) {
      return <div className="p-6">読み込み中...</div>;
    }
    if ((creatorMe as any).isError) {
      const err = (creatorMe as any).error;
      return (
        <div className="p-6">
          <div className="text-red-600 font-semibold">クリエイター権限確認に失敗</div>
          <pre className="text-xs whitespace-pre-wrap mt-2">
            {String(err?.message ?? err)}
          </pre>
        </div>
      );
    }
    if (!creatorMe.isSuccess) return <Navigate to="/" replace />;
    if (creatorMe.data?.approvalStatus !== "approved") return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // ============================
  // ⚠️ 互換：旧 role / roles 判定
  // ============================
  const allowedRoles: Role[] | null = roles ? roles : role ? [role] : null;

  if (allowedRoles) {
    // ここは型 Role で判定してOK（値参照しない）
    if (!allowedRoles.includes(user.role as Role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
