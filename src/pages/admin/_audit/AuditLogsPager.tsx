// front/src/pages/admin/_audit/AuditLogsPager.tsx

export function AuditLogsPager({
  rowsCount,
  nextCursor,
  cursor,
  fetching,
  onTop,
  onNext,
}: {
  rowsCount: number;
  nextCursor: number | null;
  cursor: number | null;
  fetching: boolean;
  onTop: () => void;
  onNext: () => void;
}) {
  return (
    <section className="card">
      <div className="admin-filter-foot">
        <div className="admin-filter-count">
          {rowsCount} 件 / nextCursor: {nextCursor ?? "-"}
        </div>

        <div className="admin-filter-actions">
          <button
            className="btn btn-ghost"
            onClick={onTop}
            disabled={cursor === null || fetching}
            type="button"
          >
            先頭
          </button>

          <button
            className="btn-primary"
            onClick={onNext}
            disabled={!nextCursor || fetching}
            type="button"
          >
            次へ
          </button>
        </div>
      </div>
    </section>
  );
}
