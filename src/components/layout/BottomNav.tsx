// front/src/components/layout/BottomNav.tsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const path = location.pathname;

  const isHome    = path === '/' || path === '/home';
  const isMyPage  = path.startsWith('/mypage');
  const isNewPost = path.startsWith('/posts/new');
  const isCreator = path.startsWith('/creators');
  const isAdmin   = path.startsWith('/admin');

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {/* ホーム */}
        <Link
          to="/"
          className={
            'bottom-nav-item ' + (isHome ? 'bottom-nav-item-active' : '')
          }
        >
          <span className="bottom-nav-icon">🏠</span>
          <span>ホーム</span>
        </Link>

        {/* マイページ */}
        <Link
          to="/mypage"
          className={
            'bottom-nav-item ' + (isMyPage ? 'bottom-nav-item-active' : '')
          }
        >
          <span className="bottom-nav-icon">👤</span>
          <span>マイページ</span>
        </Link>

        {/* 新規投稿（クリエイターのみ強調） */}
        <Link
          to="/posts/new"
          className={
            'bottom-nav-item ' + (isNewPost ? 'bottom-nav-item-active' : '')
          }
        >
          <span className="bottom-nav-icon">✏️</span>
          <span>投稿作成</span>
        </Link>

        {/* クリエイター設定 */}
        <Link
          to="/creators/settings"
          className={
            'bottom-nav-item ' + (isCreator ? 'bottom-nav-item-active' : '')
          }
        >
          <span className="bottom-nav-icon">⭐</span>
          <span>クリエイター</span>
        </Link>

        {/* 管理者タブ：admin ロールのときだけ表示 */}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className={
              'bottom-nav-item ' + (isAdmin ? 'bottom-nav-item-active' : '')
            }
          >
            <span className="bottom-nav-icon">🛠</span>
            <span>管理</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
