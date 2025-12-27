// front/src/pages/shops/ShopDashboardPage.tsx

import { ProtectedRoute } from "@/components";
import { useShopDashboardSummary } from "@/hooks";
import { Link } from "react-router-dom";
import { ApiError } from "@/lib/api";

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="card">
      <div className="section-subtitle">{title}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 6 }}>
        {value}
      </div>
    </div>
  );
}

function yen(n: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(n);
}

function getErrorMessage(err: unknown): string {
  if (!err) return "";
  if (err instanceof ApiError) {
    const msg = (err.body?.message ?? err.message ?? "") as string;
    return String(msg);
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

function getStatus(err: unknown): number | null {
  if (!err) return null;
  if (err instanceof ApiError) {
    // apiClient の実装次第で err.status or err.response.status の場合がある
    const s = (err as any).status ?? (err as any).response?.status ?? null;
    return typeof s === "number" ? s : null;
  }
  return null;
}

export default function ShopDashboardPage() {
  const { data, isLoading, error, me, refetch } = useShopDashboardSummary();

  const errMsg = getErrorMessage(error);
  const status = getStatus(error);

  // 文言依存だけだと弱いので、保険で status も見る
  const isNoShop =
    errMsg.includes("Shop に所属していません") ||
    errMsg.includes("shop に所属していません") ||
    errMsg.includes("所属していません");

  const isForbidden = status === 403;
  const isUnauthorized = status === 401;

  return (
    <ProtectedRoute require="shop">
      <div className="page">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1 className="page-title">Shopダッシュボード</h1>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {me?.role && (
              <div style={{ color: "#64748b", fontSize: 13 }}>
                権限: {me.role}
              </div>
            )}
            <button
              className="btn"
              onClick={() => refetch()}
              disabled={isLoading}
              type="button"
            >
              再読み込み
            </button>
          </div>
        </div>

        {isLoading && <div className="card">読み込み中…</div>}

        {error && (
          <div className="card">
            <div style={{ fontWeight: 800 }}>取得に失敗しました</div>

            {errMsg && (
              <div style={{ marginTop: 6, color: "#64748b" }}>{errMsg}</div>
            )}

            {/* 401/403 のときに次の導線を出す */}
            {(isUnauthorized || isForbidden) && (
              <div style={{ marginTop: 10, color: "#64748b" }}>
                ログイン状態や権限を確認してください。
              </div>
            )}

            {isNoShop && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Link className="btn" to="/shops/create">
                  Shopを作成する
                </Link>
                <Link className="btn" to="/shops/membership">
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
              marginTop: 12,
            }}
          >
            <KpiCard title="今日の売上" value={yen(data.todayGross)} />
            <KpiCard title="今月の売上" value={yen(data.monthGross)} />
            <KpiCard title="アクティブ購読者" value={`${data.activeSubscribers}人`} />
            <KpiCard
              title="承認待ちCreator申請"
              value={`${data.pendingCreatorApplications}件`}
            />
          </div>
        )}

        {/* 次段：申請一覧/売上一覧への導線 */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link className="btn" to="/shops/creator-applications">
            申請一覧へ
          </Link>
          <Link className="btn" to="/shops/sales">
            売上を見る
          </Link>
          <Link className="btn" to="/shops/membership">
            Shop所属
          </Link>

          {/* ✅ 未所属の時でも保険で出す */}
          {isNoShop && (
            <Link className="btn" to="/shops/create">
              Shopを作成する
            </Link>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
