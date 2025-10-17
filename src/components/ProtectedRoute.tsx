import { Navigate, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { JSX } from 'react';
import NewPost from '../pages/posts/NewPost';

// ProtectedRoute に props を追加
export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'creator'|'fan'|'admin' }) {
  const { user, ready, restore } = useAuth();
  if (!ready && !user) restore(true);
  if (!ready) return <div className="p-6">読み込み中...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// ルート定義
<Route path="/posts/new" element={
  <ProtectedRoute role="creator">
    <NewPost />
  </ProtectedRoute>
} />

