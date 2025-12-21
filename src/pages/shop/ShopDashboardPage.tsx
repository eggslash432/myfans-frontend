// front/src/pages/shop/ShopDashboardPage.tsx

import ProtectedRoute from "../../components/ProtectedRoute";
import { useShopDashboardSummary } from "../../hooks/useShopDashboardSummary";
import { Link } from "react-router-dom";
import { ApiError } from "../../lib/api/apiClient";

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="card">
      <div className="section-subtitle">{title}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(n);
}

function getErrorMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof ApiError) {
    // ApiError は body.message に入ってくることが多い
    const msg = (err.body?.message ?? err.message ?? "") as string;
    return String(msg);
  }
  // react-query の error が普通の Error の場合
  if (err instanceof Error) return err.message;
  return String(err);
}

export default function ShopDashboardPage() {
  const { data, isLoading, error } = useShopDashboardSummary();

  const errMsg = getErrorMessage(error);
  const isNoShop = errMsg.includes("Shop に所属していません");

  return (
    <ProtectedRoute roles={["shop_admin", "shop_staff"]}>
      <div className="page">
        <h1 className="page-title">Shopダッシュボード</h1>

        {isLoading && <div className="card">読み込み中…</div>}

        {error && (
          <div className="card">
            <div style={{ fontWeight: 800 }}>取得に失敗しました</div>
            {errMsg && <div style={{ marginTop: 6, color: "#64748b" }}>{errMsg}</div>}

            {isNoShop && (
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link className="btn" to="/shop/create">
                  Shopを作成する
                </Link>
                <Link className="btn" to="/shop/membership">
                  招待コードで参加
                </Link>
              </div>
            )}
          </div>
        )}

        {data && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <KpiCard title="今日の売上" value={yen(data.todayGross)} />
            <KpiCard title="今月の売上" value={yen(data.monthGross)} />
            <KpiCard title="アクティブ購読者" value={`${data.activeSubscribers}人`} />
            <KpiCard title="承認待ちCreator申請" value={`${data.pendingCreatorApplications}件`} />
          </div>
        )}

        {/* 次段：申請一覧/売上一覧への導線 */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="btn" to="/shop/creator-applications">
            申請一覧へ
          </Link>
          <Link className="btn" to="/shop/sales">
            売上を見る
          </Link>
          <Link className="btn" to="/shop/membership">
            Shop所属
          </Link>

          {/* ✅ 403 の時でも下に保険で出す（上のカードにも出る） */}
          {isNoShop && (
            <Link className="btn" to="/shop/create">
              Shopを作成する
            </Link>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
