// front/src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";  // パスはプロジェクトに合わせて
import { isAdminRole } from "@/lib/authz";

export function Footer() {
  const { user } = useAuth();  // { id, email, role, ... } みたいなのが入っている想定

  // ここの条件はプロジェクトの仕様に合わせて調整
  const isAdmin = isAdminRole(user?.role);

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
