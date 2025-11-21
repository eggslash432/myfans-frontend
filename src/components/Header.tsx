import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  const label = user?.email ?? (user ? `ID:${user.id}` : '');
  return (
    <header className="flex items-center justify-between p-3 border-b">
      <Link to="/" className="font-bold">Himefan</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/">ホーム</Link>
        <Link to="/mypage">マイページ</Link>
        {user?.role === 'creator' && <Link to="/posts/new">投稿作成</Link>}
        {user?.role === 'creator' && (
          <Link to="/creators/settings">クリエイター設定</Link>
        )}
        {user?.role === 'admin' && <Link to="/admin/creators">管理</Link>}
        {user ? (
          <>
            <span className="opacity-70">
              {label}{user.role ? ` (${user.role})` : ''}   {/* 役割が無ければ括弧ごと非表示 */}
            </span>
            <button className="underline" onClick={logout}>ログアウト</button>
          </>
        ) : (
          <>
            <Link to="/login">ログイン</Link>
            <Link to="/signup">新規登録</Link>
          </>
        )}
      </nav>
    </header>
  );
}
