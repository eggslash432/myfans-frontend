// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { JSX } from 'react';
import type { Role } from '../shared/prisma-enums';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: Role;
}) {
  const { user, ready, restore } = useAuth();

  // 初回はセッション復元
  if (!ready && !user) {
    restore(true);
  }

  // ローディング中
  if (!ready) {
    return <div className="p-6">読み込み中...</div>;
  }

  // 未ログイン → ログイン画面へ
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ロール指定があるのに一致していない → トップへ
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // OK
  return children;
}
