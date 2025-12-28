// front/src/pages/admin/AdminPostsPage.tsx

import { useMemo, useState } from "react";
import { useAdminPostsPage } from "@/hooks";
import type { SortKey, VisibilityFilter } from "@/shared";
import { buildViewList } from "./domain/adminPostsView";
import { AdminPostsCards, AdminPostsFilters, AdminPostsTable, ReportsModal } from "@/components";


export function AdminPostsPage() {
  const {
    list,
    loading,
    err,
    deletePost,
    updateStatus,
    reports,
    reportsPostId,
    openReports,
    resolveReport,
    closeModal,
  } = useAdminPostsPage();

  // --- 検索/フィルタ/ソート ---
  const [q, setQ] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "private">("all");
  const [filterVisibility, setFilterVisibility] = useState<VisibilityFilter>("all");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const viewList = useMemo(
    () =>
      buildViewList({
        list,
        q,
        filterStatus,
        filterVisibility,
        sortKey,
        sortDir,
      }),
    [list, q, filterStatus, filterVisibility, sortKey, sortDir],
  );

  const toggleSort = (key: SortKey, defaultDir: "asc" | "desc" = "asc") => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(defaultDir);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <section className="card">
          <p className="section-subtitle">読み込み中…</p>
        </section>
      </div>
    );
  }

  if (err) {
    return (
      <div className="page">
        <section className="card auth-card">
          <div className="auth-card-title">ログインが必要です</div>
          <p className="section-subtitle">
            セッションが切れました。もう一度ログインしてください。
          </p>

          <div className="auth-card-actions">
            <a className="btn btn-primary" href={`/login?next=${encodeURIComponent(location.pathname)}`}>
              ログインへ
            </a>
            <button className="btn btn-outline" onClick={() => location.reload()}>
              再読み込み
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page space-y-4">
      <section className="card">
        <div className="section-title">投稿管理（Admin）</div>
        <p className="section-subtitle">投稿の削除・非公開・通報確認ができます。</p>
      </section>

      <AdminPostsFilters
        q={q}
        setQ={setQ}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterVisibility={filterVisibility}
        setFilterVisibility={setFilterVisibility}
        sortKey={sortKey}
        setSortKey={setSortKey}
        sortDir={sortDir}
        setSortDir={setSortDir}
        onReset={() => {
          setQ("");
          setFilterStatus("all");
          setFilterVisibility("all");
          setSortKey("createdAt");
          setSortDir("desc");
        }}
        count={viewList.length}
      />

      <AdminPostsCards
        viewList={viewList}
        onUpdateStatus={(id, next, label) => updateStatus(id, next, label)}
        onDelete={deletePost}
        onOpenReports={openReports}
      />

      <AdminPostsTable
        viewList={viewList}
        sortKey={sortKey}
        sortDir={sortDir}
        toggleSort={toggleSort}
        onUpdateStatus={(id, next, label) => updateStatus(id, next, label)}
        onDelete={deletePost}
        onOpenReports={openReports}
      />

      {reportsPostId && (
        <ReportsModal
          postId={reportsPostId}
          reports={reports}
          onClose={closeModal}
          onResolve={resolveReport}
        />
      )}
    </div>
  );
}
