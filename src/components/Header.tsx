import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="flex items-center justify-between p-3 border-b">
      <Link to="/" className="font-bold">MyFans Clone</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/">ホーム</Link>
        <Link to="/mypage">マイページ</Link>
        {user?.role === 'creator' && <Link to="/posts/new">投稿作成</Link>}
        <Link to="/test" className="opacity-70 hover:opacity-100">検収</Link>
        {user ? (
          <>
            <span className="opacity-70">{user.email} ({user.role})</span>
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
