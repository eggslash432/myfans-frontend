// front/src/pages/shop/ShopCreatorApplicationsPage.tsx

import { ApiError } from "../../lib/api/apiClient";
import { useShopCreatorApplications } from "../../hooks/useShopCreatorApplications";
import type { ShopCreatorApplicationStatus } from "../../lib/api/shop";

function StatusBadge({ status }: { status: ShopCreatorApplicationStatus }) {
  const map = {
    pending: { label: "承認待ち", bg: "#FFF7ED", color: "#9A3412" },
    approved: { label: "承認済み", bg: "#ECFDF5", color: "#065F46" },
    rejected: { label: "却下", bg: "#F3F4F6", color: "#374151" },
  }[status];

  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 12,
        background: map.bg,
        color: map.color,
        fontWeight: 600,
      }}
    >
      {map.label}
    </span>
  );
}

function fmtDate(iso: string) {
  // "2025-12-14T..." -> "2025-12-14"
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function ShopCreatorApplicationsPage() {
  const q = useShopCreatorApplications();

  const error =
    q.error instanceof ApiError ? `${q.error.status}: ${q.error.message}` : q.error?.message;

  return (
    <div className="page">
      <h1 className="page-title">Creator申請一覧</h1>

      <div className="card">
        {q.isLoading && <div>読み込み中…</div>}
        {!q.isLoading && error && (
          <div style={{ color: "#b91c1c", fontWeight: 700 }}>取得失敗：{error}</div>
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
              {(q.data ?? []).map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td>{fmtDate(a.createdAt)}</td>
                  <td>{a.publicName}</td>
                  <td>{a.email}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {/* ここは次で詳細モーダルや承認ボタンにする想定 */}
                    <button className="btn" onClick={() => alert(`applicationId=${a.id}`)}>
                      詳細
                    </button>
                  </td>
                </tr>
              ))}

              {(q.data?.length ?? 0) === 0 && (
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
