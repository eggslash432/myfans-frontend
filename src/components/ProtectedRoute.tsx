// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";
import type { Role } from "../shared/prisma-enums";

export default function ProtectedRoute({
  children,
  role,
  roles,
}: {
  children: JSX.Element;
  role?: Role;
  roles?: Role[];
}) {
  const { user, ready } = useAuth();

  // AuthProvider 側でアプリ起動時に restore() 済みなので、
  // ProtectedRoute では副作用を起こさない（見るだけ）

  if (!ready) {
    return <div className="p-6">読み込み中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 単一ロール指定
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // 複数ロール指定（role 未設定は拒否）
  if (roles && (!user.role || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
