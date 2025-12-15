import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { SubTitleRule } from "../../shared/types";

const SUB_TITLE_RULES: SubTitleRule[] = [
  // --- Creator ---
  { match: (p) => p.startsWith("/creator/posts"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creator/plans"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creator/payouts"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creator/analytics"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creators/settings"), label: "クリエイター設定" },

  // --- My page / User ---
  { match: (p) => p.startsWith("/mypage"), label: "マイページ" },
  { match: (p) => p.startsWith("/settings"), label: "設定" },

  // --- Admin（将来用） ---
  { match: (p) => p.startsWith("/admin"), label: "管理画面" },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready, logout } = useAuth();

  const subTitle =
    SUB_TITLE_RULES.find((r) => r.match(location.pathname))?.label ?? "";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("logout failed", e);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isLoggedIn = ready && !!user;
  const next = encodeURIComponent(location.pathname);

  return (
    <header className="header-mobile">
      <div className="header-mobile-inner">
        <div className="header-title">
          <Link to="/" className="header-logo">
            Himefan
          </Link>
          {subTitle && <span className="header-sub">{subTitle}</span>}
        </div>

        <div className="header-actions">
          {!ready ? (
            <span className="header-loading">…</span>
          ) : isLoggedIn ? (
            <>
              <span className="header-user">
                {user!.email} {user!.role ? `(${user!.role})` : ""}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link className="header-link" to={`/login?next=${next}`}>
                ログイン
              </Link>
              <Link className="header-link" to="/signup">
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
