import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  HomeIcon,
  UserIcon,
  PencilSquareIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const path = location.pathname;

  const isHome = path === "/" || path === "/home";
  const isMyPage = path.startsWith("/mypage");
  const isNewPost = path.startsWith("/posts/new");
  const isCreator = path.startsWith("/creators");
  const isAdmin = path.startsWith("/admin");
  const isSettings = path.startsWith("/settings");
  const isShop = path.startsWith("/shop"); // ✅ /shop 配下で active

  // ✅ shop_admin / shop_staff のときだけ Shop タブ表示
  const canSeeShop =
    user?.role === "shop_admin" || user?.role === "shop_staff";

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {/* ホーム */}
        <Link
          to="/"
          className={"bottom-nav-item " + (isHome ? "bottom-nav-item-active" : "")}
        >
          <HomeIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">ホーム</span>
        </Link>

        {/* マイページ */}
        <Link
          to="/mypage"
          className={"bottom-nav-item " + (isMyPage ? "bottom-nav-item-active" : "")}
        >
          <UserIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">マイページ</span>
        </Link>

        {/* 新規投稿 */}
        <Link
          to="/posts/new"
          className={"bottom-nav-item " + (isNewPost ? "bottom-nav-item-active" : "")}
        >
          <PencilSquareIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">投稿作成</span>
        </Link>

        {/* クリエイター設定 */}
        <Link
          to="/creators/settings"
          className={"bottom-nav-item " + (isCreator ? "bottom-nav-item-active" : "")}
        >
          <SparklesIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">クリエイター</span>
        </Link>

        {/* ✅ Shop（shop_admin / shop_staff のときだけ表示） */}
        {canSeeShop && (
          <Link
            to="/shop"
            className={"bottom-nav-item " + (isShop ? "bottom-nav-item-active" : "")}
          >
            <BuildingStorefrontIcon className="bottom-nav-icon" />
            <span className="bottom-nav-label">Shop</span>
          </Link>
        )}

        {/* 設定 */}
        <Link
          to="/settings"
          className={"bottom-nav-item " + (isSettings ? "bottom-nav-item-active" : "")}
        >
          <Cog6ToothIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">設定</span>
        </Link>

        {/* 管理者タブ：admin ロールのときだけ表示 */}
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className={"bottom-nav-item " + (isAdmin ? "bottom-nav-item-active" : "")}
          >
            <WrenchScrewdriverIcon className="bottom-nav-icon" />
            <span className="bottom-nav-label">管理</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
