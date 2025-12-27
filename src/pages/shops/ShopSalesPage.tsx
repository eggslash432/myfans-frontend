// front/src/pages/shops/ShopSalesPage.tsx
import { useMemo, useState } from "react";
import { ApiError } from "../../lib/api/apiClient";
import { useShopSalesSummary } from "../../hooks/useShopSalesSummary";
import { yen, type ShopSalesRange } from "@/shared";
import { RangeButton } from "@/components";

export function ShopSalesPage() {
  const [range, setRange] = useState<ShopSalesRange>("month");
  const q = useShopSalesSummary(range);

  const errorText = useMemo(() => {
    if (!q.error) return null;
    if (q.error instanceof ApiError) return `${q.error.status}: ${q.error.message}`;
    return q.error.message;
  }, [q.error]);

  const s = q.data;

  return (
    <div className="page">
      <h1 className="page-title">売上（サマリ）</h1>

      <div className="card" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <RangeButton label="今日" value="today" current={range} onClick={setRange} />
        <RangeButton label="今月" value="month" current={range} onClick={setRange} />
        <RangeButton label="全期間" value="all" current={range} onClick={setRange} />
      </div>

      <div className="card">
        {q.isLoading && <div>読み込み中…</div>}
        {!q.isLoading && errorText && (
          <div style={{ color: "#b91c1c", fontWeight: 700 }}>取得失敗：{errorText}</div>
        )}

        {!q.isLoading && !errorText && s && (
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <div className="card" style={{ padding: 12 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>売上（総額）</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{yen(s.gross)}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>手数料</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{yen(s.platformFee)}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>入金対象</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{yen(s.net)}</div>
              </div>
              <div className="card" style={{ padding: 12 }}>
                <div style={{ color: "#64748b", fontSize: 12 }}>取引数</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{s.transactions}</div>
              </div>
            </div>

            <div style={{ color: "#64748b", fontSize: 12 }}>
              ※ 日次一覧（テーブル）は次段で API を「日別集計」対応したら追加する想定
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
