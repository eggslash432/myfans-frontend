// front/src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import { isAdminRole } from "@/lib";
import { useAuth } from "@/features/auth";

export function Footer() {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);

  return (
    <footer className="footer-root">
      <div className="footer-main" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>© {new Date().getFullYear()} Himefan</span>

        <nav
          className="footer-links"
          aria-label="フッターリンク"
          style={{ display: "flex", gap: 12, marginLeft: "auto" }}
        >
          <Link to="/guide" className="footer-link">ご利用ガイド</Link>
          <Link to="/faq" className="footer-link">FAQ</Link>
        </nav>
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

