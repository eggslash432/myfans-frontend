// front/src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Role } from "@/shared";
import type { Require } from "@/shared";
import { useAuth } from "@/features/auth";
import { useShopMe } from "@/features/shops";
import { useCreatorMe } from "@/features/creators";

type Props = {
  children: ReactNode;

  /** 互換（旧方式） */
  role?: Role;
  roles?: Role[];

  /** 新方式 */
  require?: Require;
};

// Nest/ApiErrorの揺れを吸収して code を取り出す
function pickCode(body: any): string | undefined {
  // 例1) { code: "..." }
  if (typeof body?.code === "string") return body.code;

  // 例2) NestのException: { message: "..." } or { message: { code: "..." } }
  if (typeof body?.message === "string") return undefined;
  if (typeof body?.message?.code === "string") return body.message.code;

  // 例3) さらに入れ子の可能性（保険）
  if (typeof body?.response?.code === "string") return body.response.code;
  if (typeof body?.response?.message?.code === "string") return body.response.message.code;

  return undefined;
}

export function ProtectedRoute({ children, role, roles, require }: Props) {
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
    const r = String(user.role ?? "");
    if (r !== "admin" && r !== "sub_admin") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  if (require === "shop") {
    if (shopMe.isLoading) return <div className="p-6">読み込み中...</div>;

    // ★修正：エラー詳細を見て分岐（未承認は license へ）
    if ((shopMe as any).isError) {
      const err = (shopMe as any).error;

      // apiClient.ts の ApiError 形式を想定
      const status: number | undefined = err?.status;
      const body: any = err?.body;

      const code = pickCode(body);

      // ★デバッグ（必要なければ消してOK）
      // console.log("[ProtectedRoute][shop] error", { status, body, code });

      if (status === 403 && code === "BUSINESS_LICENSE_NOT_APPROVED") {
        return <Navigate to="/shops/me/license" replace />;
      }

      // 「店舗に所属してない」「権限不足」などは従来通りホーム
      return <Navigate to="/" replace />;
    }

    // isError を先に処理してるので、ここは成功のみ
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
    if (!allowedRoles.includes(user.role as Role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
