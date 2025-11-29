// front/src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";  // パスはプロジェクトに合わせて

export default function Footer() {
  const { user } = useAuth();  // { id, email, role, ... } みたいなのが入っている想定

  // ここの条件はプロジェクトの仕様に合わせて調整
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="footer-root">
      <div className="footer-main">
        © {new Date().getFullYear()} Himefan
      </div>

      {isAdmin && (
        <div className="footer-admin">
          <Link to="/admin" className="footer-admin-link">
            管理者の方は管理ページへ
          </Link>
        </div>
      )}
    </footer>
  );
}
