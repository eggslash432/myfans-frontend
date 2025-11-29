// front/src/components/Header.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";              // ← これがさっきの api.ts

// もし useAuth があるならメール表示に使う
import { useAuth } from "../../hooks/useAuth"; // パスはプロジェクトに合わせて

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();  // { email, role, ... } が入っている想定

  const isMyPage = location.pathname.startsWith("/mypage");
  const isCreator = location.pathname.startsWith("/creators");

  let subTitle = "";
  if (isMyPage) subTitle = "マイページ";
  else if (isCreator) subTitle = "クリエイター設定";

  const handleLogout = async () => {
    try {
      await logout();          // /auth/logout を叩いて token 削除
    } catch (e) {
      console.error("logout failed", e);
      // 失敗しても一応ログイン画面へ飛ばしてしまう
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isLoggedIn = !!user;  // useAuth がなければこの行消して、常にログアウトボタンでもOK

  return (
    <header className="header-mobile">
      <div className="header-mobile-inner">
        <div className="header-title">
          <Link to="/" className="header-logo">
            Himefan
          </Link>
          {subTitle && <span className="header-sub">{subTitle}</span>}
        </div>

        {/* 右側：ログイン状態に応じて切り替え */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLoggedIn ? (
            <>
              {/* メールとロールはお好みで */}
              <span style={{ fontSize: 11, color: "#6b7280" }}>
                {user?.email} {user?.role && `(${user.role})`}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}
              >
                ログイン
              </Link>
              <Link
                to="/signup"
                style={{ fontSize: 12, color: "#6b7280", textDecoration: "none" }}
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
