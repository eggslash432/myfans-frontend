// front/src/pages/shop/ShopCreatorApplicationsPage.tsx

type CreatorApplication = {
  id: string;
  creatorName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
};

const MOCK_APPLICATIONS: CreatorApplication[] = [
  {
    id: "app_1",
    creatorName: "テストクリエイターA",
    email: "a@example.com",
    status: "pending",
    appliedAt: "2025-12-14",
  },
  {
    id: "app_2",
    creatorName: "テストクリエイターB",
    email: "b@example.com",
    status: "approved",
    appliedAt: "2025-12-10",
  },
  {
    id: "app_3",
    creatorName: "テストクリエイターC",
    email: "c@example.com",
    status: "rejected",
    appliedAt: "2025-12-08",
  },
];

function StatusBadge({ status }: { status: CreatorApplication["status"] }) {
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

export default function ShopCreatorApplicationsPage() {
  return (
    <div className="page">
      <h1 className="page-title">Creator申請一覧</h1>

      <div className="card">
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
            {MOCK_APPLICATIONS.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td>{a.appliedAt}</td>
                <td>{a.creatorName}</td>
                <td>{a.email}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td style={{ textAlign: "right" }}>
                  <button className="btn">詳細</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
