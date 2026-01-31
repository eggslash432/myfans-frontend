// front/src/pages/admin/_audit/AuditLogsTable.tsx

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export type AuditLogRow = {
  id: number;
  createdAt: string;
  actorId: string;
  actorRole?: string | null;
  action: string;
  target?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  meta?: any;
};

export function AuditLogsTable({
  rows,
  loading,
}: {
  rows: AuditLogRow[];
  loading: boolean;
}) {
  return (
    <section className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 90 }}>ID</th>
            <th style={{ width: 220 }}>日時</th>
            <th style={{ width: 240 }}>actor</th>
            <th style={{ width: 200 }}>action</th>
            <th style={{ width: 280 }}>target</th>
            <th>meta</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="admin-id">{r.id}</td>
              <td>{fmt(r.createdAt)}</td>

              <td>
                <div className="admin-id">{r.actorId}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {r.actorRole ?? "-"}
                </div>
              </td>

              <td>
                <div className="admin-id" style={{ color: "#111827" }}>
                  {r.action}
                </div>
              </td>

              <td>
                <div className="admin-id">{r.target ?? "-"}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {r.targetType ?? "-"} / {r.targetId ?? "-"}
                </div>
              </td>

              <td>
                <details>
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 700,
                    }}
                  >
                    展開
                  </summary>
                  <pre
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(r.meta ?? null, null, 2)}
                  </pre>
                </details>
              </td>
            </tr>
          ))}

          {!rows.length && !loading && (
            <tr>
              <td colSpan={6} style={{ padding: 18, color: "#6b7280" }}>
                ログがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
