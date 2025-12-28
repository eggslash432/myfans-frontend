// front/src/pages/admin/AdminReportsPage.tsx

import { useAdminReports } from "@/features/admin";
import { ReportCard } from "@/features/reports";



export function AdminReportsPage() {
  const { reports, loading, err, busyKey, load, resolve, makePrivate } = useAdminReports();

  return (
    <div className="page">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between" style={{ marginBottom: "4px" }}>
          <h1 className="page-title" style={{ marginBottom: 0, textAlign: "left" }}>
            通報一覧
          </h1>

          <button type="button" onClick={load} className="btn btn-outline btn-sm">
            ⟳ 再読み込み
          </button>
        </div>

        {loading && (
          <div className="page-description" style={{ marginBottom: 0 }}>
            読み込み中…
          </div>
        )}

        {err && <div className="auth-error">{err}</div>}

        {!loading && !err && reports.length === 0 && (
          <div className="page-description" style={{ marginBottom: 0 }}>
            現在、通報はありません。
          </div>
        )}

        {!loading && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                busyKey={busyKey}
                onResolve={resolve}
                onMakePrivate={makePrivate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

