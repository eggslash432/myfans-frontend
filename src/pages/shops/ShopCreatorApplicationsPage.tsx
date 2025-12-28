// front/src/pages/shops/ShopCreatorApplicationsPage.tsx

import { ApiError } from "@/lib/api";
import { useShopCreatorApplications } from "@/hooks";
import { StatusBadge } from "@/components";
import { fmtDate } from "@/utils";


export function ShopCreatorApplicationsPage() {
  const q = useShopCreatorApplications("pending");

  const error =
    q.error instanceof ApiError
      ? `${q.error.status}: ${q.error.message}`
      : q.error?.message;

  const items = q.data?.items ?? [];

  return (
    <div className="page">
      <h1 className="page-title">Creator申請一覧</h1>

      <div className="card">
        {q.isLoading && <div>読み込み中…</div>}
        {!q.isLoading && error && (
          <div style={{ color: "#b91c1c", fontWeight: 700 }}>
            取得失敗：{error}
          </div>
        )}

        {!q.isLoading && !error && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                <th>申請日</th>
                <th>クリエイター名</th>
                <th>メール</th>
                <th>ステータス</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td>{fmtDate(a.createdAt)}</td>
                  <td>{a.publicName}</td>
                  <td>{a.email}</td>
                  <td>
                    {/* StatusBadge の props 仕様に合わせる必要あり */}
                    <StatusBadge status={a.status} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn" onClick={() => alert(`applicationId=${a.id}`)}>
                      詳細
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "12px 0", color: "#64748b" }}>
                    申請はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
