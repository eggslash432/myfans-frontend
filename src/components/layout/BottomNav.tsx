// front/src/components/layout/BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { isAdminRole } from "@/lib/authz";
import {
  HomeIcon,
  UserIcon,
  PencilSquareIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/features/auth";
import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api/apiClient";

type ShopContext = {
  shopId: string;
  role: string;
  businessLicenseStatus: "pending" | "approved" | "rejected" | string;
};

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const path = location.pathname;

  const isHome = path === "/" || path === "/home";
  const isMyPage = path.startsWith("/mypage");
  const isNewPost = path.startsWith("/posts/new");
  const isCreator = path.startsWith("/creators");
  const isAdmin = path.startsWith("/admin");
  const isSettings = path.startsWith("/settings");
  const isShop = path.startsWith("/shops");

  // ✅ Shopタブ表示判定：
  //   - /shops/me は未承認で403になるので BottomNav では使わない
  //   - 代わりに「所属確認だけ」できる /shops/me/context を叩く（未承認でも200想定）
  const shopCtx = useQuery({
    queryKey: ["shopContext"],
    enabled: !!user, // ログインしてる時だけ
    queryFn: () => request<ShopContext>("/shops/me/context", { method: "GET" }),
    retry: false,
    staleTime: 60_000, // 下部ナビのため無駄に叩かない
  });

  const canSeeShop = shopCtx.isSuccess; // 所属していればtrue（未承認でもtrue）
  const canSeeAdmin = isAdminRole(user?.role);

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        <Link
          to="/"
          className={"bottom-nav-item " + (isHome ? "bottom-nav-item-active" : "")}
        >
          <HomeIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">ホーム</span>
        </Link>

        <Link
          to="/mypage"
          className={"bottom-nav-item " + (isMyPage ? "bottom-nav-item-active" : "")}
        >
          <UserIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">マイページ</span>
        </Link>

        <Link
          to="/posts/new"
          className={"bottom-nav-item " + (isNewPost ? "bottom-nav-item-active" : "")}
        >
          <PencilSquareIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">投稿作成</span>
        </Link>

        <Link
          to="/creators/settings"
          className={"bottom-nav-item " + (isCreator ? "bottom-nav-item-active" : "")}
        >
          <SparklesIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">クリエイター</span>
        </Link>

        {/* ✅ Shop（所属している人だけ表示。未承認でも表示はOK） */}
        {canSeeShop && (
          <Link
            to="/shops"
            className={"bottom-nav-item " + (isShop ? "bottom-nav-item-active" : "")}
          >
            <BuildingStorefrontIcon className="bottom-nav-icon" />
            <span className="bottom-nav-label">Shop</span>
          </Link>
        )}

        <Link
          to="/settings"
          className={"bottom-nav-item " + (isSettings ? "bottom-nav-item-active" : "")}
        >
          <Cog6ToothIcon className="bottom-nav-icon" />
          <span className="bottom-nav-label">設定</span>
        </Link>

        {canSeeAdmin && (
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
