// front/src/pages/admin/AdminAuditLogsPage.tsx

import { useState } from "react";
import { useAdminAuditLogs } from "@/features";
import { AuditLogsFilterCard } from "./_audit/AuditLogsFilterCard";
import { AuditLogsTable } from "./_audit/AuditLogsTable";
import { AuditLogsPager } from "./_audit/AuditLogsPager";
import { buildAuditLogsQuery, type AuditLogsUiState } from "./_audit/useAuditLogsQuery";

export default function AdminAuditLogsPage() {
  const [state, setState] = useState<AuditLogsUiState>({
    take: 50,
    cursor: null,
    action: "",
    actorId: "",
    targetType: "",
    targetId: "",
    actorQ: "",
    targetQ: "",
  });

  const query = buildAuditLogsQuery(state);
  const q = useAdminAuditLogs(query);

  const rows = q.data?.rows ?? [];
  const nextCursor = q.data?.nextCursor ?? null;

  return (
    <div className="page space-y-4 max-w-6xl mx-auto">
      <section className="text-center">
        <h1 className="page-title">監査ログ</h1>
        <p className="page-description">
          管理操作（凍結・権限変更など）の履歴を確認します。
        </p>
      </section>

      <AuditLogsFilterCard
        state={state}
        setState={setState}
        rowsCount={rows.length}
        nextCursor={nextCursor}
        loading={q.isLoading}
        fetching={q.isFetching}
        error={q.isError ? q.error : null}
        onRefetch={() => q.refetch()}
        onGoTop={() => setState((s) => ({ ...s, cursor: null }))}
      />

      <AuditLogsTable rows={rows} loading={q.isLoading} />

      <AuditLogsPager
        rowsCount={rows.length}
        nextCursor={nextCursor}
        cursor={state.cursor}
        fetching={q.isFetching}
        onTop={() => setState((s) => ({ ...s, cursor: null }))}
        onNext={() => nextCursor && setState((s) => ({ ...s, cursor: nextCursor }))}
      />
    </div>
  );
}
