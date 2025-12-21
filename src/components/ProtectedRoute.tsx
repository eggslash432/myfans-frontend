// front/src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useShopMe } from "@/hooks/useShopMe";
import { useCreatorMe } from "@/hooks/useCreatorMe";
import type { ReactNode } from "react";
import type { Role } from "@/shared/prisma-enums";

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

  // 1) auth 初期化待ち
  if (!ready) return <div className="p-6">読み込み中...</div>;

  // 2) 未ログイン
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // ============================
  // ✅ require 判定（新方式）
  // ============================
  if (require === "auth") {
    return <>{children}</>;
  }

  if (require === "admin") {
    if (user.role !== "admin" && user.role !== "sub_admin") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  if (require === "shop") {
    if (shopMe.isLoading) return <div className="p-6">読み込み中...</div>;
    if (!shopMe.isSuccess) return <Navigate to="/" replace />;
    return <>{children}</>;
  }

  // Creator（承認済み Creator の存在）
  if (require === "creator") {
    // ✅ isFetching も見る（SPA遷移時の一瞬の穴を潰す）
    if (creatorMe.isLoading || (creatorMe as any).isFetching) {
      return <div className="p-6">読み込み中...</div>;
    }

    // ✅ エラー時は無言で戻さず、原因が見えるようにする（後で戻してOK）
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

    if (creatorMe.data?.approvalStatus !== "approved") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // ============================
  // ⚠️ 互換：旧 role / roles 判定
  // （require 未指定のときのみ）
  // ============================
  const allowedRoles: Role[] | null =
    roles ? roles : role ? [role] : null;

  if (allowedRoles) {
    if (!allowedRoles.includes(user.role as Role)) {
      return <Navigate to="/" replace />;
    }
  }

  // ⭐ 最後は必ず children を返す
  return <>{children}</>;
}
