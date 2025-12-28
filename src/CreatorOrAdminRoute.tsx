// front/src/CreatorOrAdminRoute.tsx

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components";
import { 
  useAuth,
 } from "@/features/auth";
import { useCreatorMe } from "@/features/creators";

export default function CreatorOrAdminRoute({ children }: { children: ReactNode }) {
  // まずログイン必須
  return (
    <ProtectedRoute require="auth">
      <CreatorOrAdminInner>{children}</CreatorOrAdminInner>
    </ProtectedRoute>
  );
}

function CreatorOrAdminInner({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();

  const creatorMe = useCreatorMe({
    enabled: !!user && user.role !== "admin" && user.role !== "sub_admin",
  });

  if (!ready) return <div className="p-6">読み込み中...</div>;

  // admin は即OK
  if (user?.role === "admin" || user?.role === "sub_admin") {
    return <>{children}</>;
  }

  // creator 承認チェック
  if (
    creatorMe.isSuccess &&
    creatorMe.data && // ✅ null ガード
    creatorMe.data.approvalStatus === "approved"
  ) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
}

