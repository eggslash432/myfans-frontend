import ProtectedRoute from "../../components/ProtectedRoute";
import { useShopDashboardSummary } from "../../hooks/useShopDashboardSummary";

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

export default function ShopDashboardPage() {
  const { data, isLoading, error } = useShopDashboardSummary();

  return (
    <ProtectedRoute roles={["shop_admin", "shop_staff"]}>
      <div className="page">
        <h1 className="page-title">Shopダッシュボード</h1>

        {isLoading && <div className="card">読み込み中…</div>}
        {error && <div className="card">取得に失敗しました</div>}

        {data && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <KpiCard title="今日の売上" value={yen(data.todayGross)} />
            <KpiCard title="今月の売上" value={yen(data.monthGross)} />
            <KpiCard title="アクティブ購読者" value={`${data.activeSubscribers}人`} />
            <KpiCard title="承認待ちCreator申請" value={`${data.pendingCreatorApplications}件`} />
          </div>
        )}

        {/* 次段：申請一覧/売上一覧への導線 */}
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <a className="btn" href="/shop/creator-applications">申請一覧へ</a>
          <a className="btn" href="/shop/sales">売上を見る</a>
        </div>
      </div>
    </ProtectedRoute>
  );
}
