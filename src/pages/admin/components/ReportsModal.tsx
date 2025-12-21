// front/src/pages/admin/components/ReportsModal.tsx

import type { ReportItem } from "../../../shared/types";

export function ReportsModal(props: {
  postId: string;
  reports: ReportItem[];
  onClose: () => void;
  onResolve: (reportId: string, action: "reviewed" | "dismissed") => void;
}) {
  const { postId, reports, onClose, onResolve } = props;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <div>
            <div className="section-title" style={{ marginBottom: 2 }}>
              通報一覧
            </div>
            <div className="section-subtitle">Post ID: {postId}</div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            閉じる
          </button>
        </div>

        {reports.length === 0 ? (
          <section className="card" style={{ background: "#f9fafb" }}>
            <p className="section-subtitle">通報はありません。</p>
          </section>
        ) : (
          <div className="space-y-2">
            {reports.map((r) => (
              <section key={r.id} className="card" style={{ padding: 12 }}>
                <div className="text-xs" style={{ color: "#6b7280" }}>
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div style={{ marginTop: 6, fontWeight: 700 }}>理由</div>
                <div className="text-sm">{r.reason}</div>

                <div style={{ marginTop: 8 }} className="text-xs">
                  ステータス:{" "}
                  {r.status === "reviewed" ? (
                    <span style={{ color: "#065f46", fontWeight: 700 }}>対応済み</span>
                  ) : r.status === "dismissed" ? (
                    <span style={{ color: "#374151", fontWeight: 700 }}>却下</span>
                  ) : (
                    <span style={{ color: "#991b1b", fontWeight: 700 }}>未対応</span>
                  )}
                </div>

                {!(r.status === "reviewed" || r.status === "dismissed") && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button className="btn btn-primary btn-xs" onClick={() => onResolve(r.id, "reviewed")}>
                      対応済みにする
                    </button>
                    <button className="btn btn-outline btn-xs" onClick={() => onResolve(r.id, "dismissed")}>
                      却下
                    </button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
