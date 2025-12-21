// front/src/pages/admin/components/AdminPostsFilters.tsx

import type { SortKey, PostStatus, VisibilityFilter } from "../domain/adminPostsView";

export function AdminPostsFilters(props: {
  q: string;
  setQ: (v: string) => void;
  filterStatus: "all" | PostStatus;
  setFilterStatus: (v: "all" | PostStatus) => void;
  filterVisibility: VisibilityFilter;
  setFilterVisibility: (v: VisibilityFilter) => void;
  sortKey: SortKey;
  setSortKey: (v: SortKey) => void;
  sortDir: "asc" | "desc";
  setSortDir: (v: "asc" | "desc") => void;
  onReset: () => void;
  count: number;
}) {
  const {
    q,
    setQ,
    filterStatus,
    setFilterStatus,
    filterVisibility,
    setFilterVisibility,
    sortKey,
    setSortKey,
    sortDir,
    setSortDir,
    onReset,
    count,
  } = props;

  return (
    <section className="card admin-filter">
      <div className="admin-filter-head">
        <div>
          <div className="section-title">検索・絞り込み</div>
          <div className="section-subtitle">投稿を素早く探して操作できます。</div>
        </div>

        <div className="admin-filter-actions">
          <button
            className="btn btn-outline"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            type="button"
          >
            {sortDir === "asc" ? "昇順" : "降順"}
          </button>

          <button className="btn btn-outline" onClick={onReset} type="button">
            リセット
          </button>
        </div>
      </div>

      <div className="admin-filter-grid2">
        <label className="admin-field admin-field--full">
          <span className="admin-field-label">検索</span>
          <input
            className="admin-input"
            placeholder="タイトル / 投稿ID / クリエイター名"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">状態</span>
          <select
            className="admin-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">すべて</option>
            <option value="published">公開</option>
            <option value="private">非公開</option>
            <option value="draft">下書き</option>
          </select>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">公開範囲</span>
          <select
            className="admin-select"
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value as any)}
          >
            <option value="all">すべて</option>
            <option value="free">無料</option>
            <option value="plan">プラン</option>
            <option value="paid_single">PPV</option>
          </select>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">並び</span>
          <select
            className="admin-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="createdAt">作成日</option>
            <option value="publishedAt">公開日</option>
            <option value="title">タイトル</option>
            <option value="creatorName">クリエイター</option>
            <option value="reportsCount">通報数</option>
            <option value="status">状態</option>
          </select>
        </label>
      </div>

      <div className="admin-filter-foot">
        <div className="admin-filter-count">表示件数: {count} 件</div>
        <div className="admin-filter-hint">※テーブルのヘッダークリックでも並び替えできます</div>
      </div>
    </section>
  );
}
