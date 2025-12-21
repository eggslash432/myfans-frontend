// front/src/CreatorOrAdminRoute.tsx

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorMe } from "@/hooks/useCreatorMe";

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
  const creatorMe = useCreatorMe({ enabled: !!user && user.role !== "admin" && user.role !== "sub_admin" });

  if (!ready) return <div className="p-6">読み込み中...</div>;

  // adminは即OK
  if (user?.role === "admin" || user?.role === "sub_admin") return <>{children}</>;

  // creator承認済みならOK
  if (creatorMe.isSuccess && creatorMe.data.approvalStatus === "approved") {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
}
