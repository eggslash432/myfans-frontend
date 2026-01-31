// front/src/components/layout/Header.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { SubTitleRule } from "@/shared";
import { useEffect, useState } from "react";
import { getMyNotifications } from "@/features/notifications";

const SUB_TITLE_RULES: SubTitleRule[] = [
  // --- Creator ---
  // 互換のため /creator と /creators の両方を拾う
  { match: (p) => p.startsWith("/creator/posts"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creator/plans"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creator/payouts"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creator/analytics"), label: "クリエイター" },

  { match: (p) => p.startsWith("/creators/posts"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creators/plans"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creators/payouts"), label: "クリエイター" },
  { match: (p) => p.startsWith("/creators/analytics"), label: "クリエイター" },

  { match: (p) => p.startsWith("/creators/settings"), label: "クリエイター設定" },

  // --- Shop ---
  { match: (p) => p.startsWith("/shops"), label: "Shop管理" },

  // --- My page / User ---
  { match: (p) => p.startsWith("/mypage"), label: "マイページ" },
  { match: (p) => p.startsWith("/settings"), label: "設定" },

  // --- Admin（将来用） ---
  { match: (p) => p.startsWith("/admin"), label: "管理画面" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!ready || !user) return;
      try {
        const res = await getMyNotifications({ unreadOnly: true, take: 1, skip: 0 });
        if (!cancelled) setUnreadCount(res.data.total ?? 0);
      } catch (e) {
        console.error("getUnreadCount failed", e);
        if (!cancelled) setUnreadCount(0);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [ready, user?.id, location.pathname]);

  const emailShort = user?.email?.split("@")[0] ?? "";
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
              <Link to="/notifications" className="header-link">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  通知
                  {unreadCount > 0 && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 18,
                        height: 18,
                        padding: "0 6px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: "#ff3b30",
                        color: "#fff",
                        lineHeight: "18px",
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>
              </Link>

              <span className="header-user">
                {emailShort} {user!.role ? `(${user!.role})` : ""}
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
