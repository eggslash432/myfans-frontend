// front/src/pages/admin/_audit/AuditLogsFilterCard.tsx

import type { Dispatch, SetStateAction } from "react";
import type { AuditLogsUiState } from "./useAuditLogsQuery";

type Props = {
  state: AuditLogsUiState;
  setState: Dispatch<SetStateAction<AuditLogsUiState>>;

  rowsCount: number;
  nextCursor: number | null;

  loading: boolean;
  fetching: boolean;
  errorMessage?: string | null;

  onRefetch: () => void;
  onGoTop: () => void;
};

export function AuditLogsFilterCard({
  state,
  setState,
  rowsCount,
  nextCursor,
  loading,
  fetching,
  errorMessage,
  onRefetch,
  onGoTop,
}: Props) {
  return (
    <section className="card admin-filter">
      <div className="admin-filter-head">
        <div>
          <div className="section-title">検索条件</div>
          <div className="section-subtitle">
            action / actor / target を指定して絞り込めます（email検索も可）。
          </div>
        </div>

        <div className="admin-filter-actions">
          <button className="btn-primary" onClick={onRefetch} disabled={fetching} type="button">
            再読み込み
          </button>

          <button className="btn btn-ghost" onClick={onGoTop} disabled={fetching} type="button">
            先頭へ
          </button>
        </div>
      </div>

      <div className="admin-filter-grid2">
        <Field label="action">
          <input
            className="admin-input"
            placeholder="例: USER_FREEZE"
            value={state.action}
            onChange={(e) => setState((s) => ({ ...s, action: e.target.value }))}
          />
        </Field>

        <Field label="actor(email)">
          <input
            className="admin-input"
            placeholder="例: admin@ / example.com"
            value={state.actorQ}
            onChange={(e) => setState((s) => ({ ...s, actorQ: e.target.value }))}
          />
        </Field>

        <Field label="target user(email)">
          <input
            className="admin-input"
            placeholder="例: user@ / gmail.com"
            value={state.targetQ}
            onChange={(e) => setState((s) => ({ ...s, targetQ: e.target.value }))}
          />
        </Field>

        <Field label="actorId">
          <input
            className="admin-input"
            placeholder="操作した管理者の userId"
            value={state.actorId}
            onChange={(e) => setState((s) => ({ ...s, actorId: e.target.value }))}
          />
        </Field>

        <Field label="targetType">
          <input
            className="admin-input"
            placeholder="例: User / Post"
            value={state.targetType}
            onChange={(e) => setState((s) => ({ ...s, targetType: e.target.value }))}
          />
        </Field>

        <Field label="targetId">
          <input
            className="admin-input"
            placeholder="対象ID（userId / postId など）"
            value={state.targetId}
            onChange={(e) => setState((s) => ({ ...s, targetId: e.target.value }))}
          />
        </Field>

        <Field label="表示件数">
          <select
            className="admin-select"
            value={String(state.take)}
            onChange={(e) => setState((s) => ({ ...s, take: Number(e.target.value) }))}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </Field>
      </div>

      <div className="admin-filter-foot">
        <div className="admin-filter-count">{loading ? "読み込み中..." : `${rowsCount} 件`}</div>
        <div className="admin-filter-hint">nextCursor: {nextCursor ?? "-"}</div>
      </div>

      {errorMessage && (
        <div className="text-xs" style={{ color: "#ef4444", marginTop: 10 }}>
          取得に失敗しました: {errorMessage}
        </div>
      )}

      <div className="section-subtitle" style={{ marginTop: 10 }}>
        ※ target user(email) はユーザー対象のログのみ検索します（API側で targetType=User に固定）。
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-field">
      <div className="admin-field-label">{label}</div>
      {children}
    </div>
  );
}
