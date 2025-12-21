// front/src/pages/admin/reports/components/ReportCard.tsx

import { Link } from "react-router-dom";
import type { ReportItem, ReportStatus } from "@/shared";
import { getStatusMeta, isDone, postStatusLabel } from "../domain/reportView";

export default function ReportCard(props: {
  report: ReportItem;
  busyKey: string | null;
  onResolve: (id: string, action: ReportStatus) => void;
  onMakePrivate: (postId: string) => void;
}) {
  const { report: r, busyKey, onResolve, onMakePrivate } = props;

  const meta = getStatusMeta(r.status);
  const done = isDone(r.status);

  const reportBusy = busyKey === r.id;
  const postBusy = busyKey === `post:${r.postId}`;
  const busy = reportBusy || postBusy;

  const postStatus = (r as any).postPublishedStatus as string | null | undefined;
  const isPrivate = postStatus === "private";

  return (
    <div className="card" style={{ padding: "12px 14px", fontSize: "13px" }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>通報ID: {r.id}</div>

      <div>
        投稿: {r.postTitle || "（タイトルなし）"}{" "}
        {r.postId && (
          <span style={{ fontSize: 11, color: "#9ca3af" }}>ID: {r.postId}</span>
        )}
      </div>

      <div style={{ marginTop: 6 }}>
        投稿ステータス: <b>{postStatusLabel(postStatus)}</b>
      </div>

      <div>通報者: {r.reporterEmail || "（不明）"}</div>
      <div>理由: {r.reason || "(未入力)"}</div>

      {r.postId && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn btn-outline btn-sm" to={`/posts/${r.postId}`}>
            投稿詳細へ
          </Link>

          <button
            type="button"
            disabled={isPrivate || busy}
            onClick={() => onMakePrivate(r.postId)}
            className="btn btn-outline btn-sm"
            title={isPrivate ? "既に非公開です" : undefined}
            style={isPrivate || busy ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            {postBusy ? "更新中…" : "この投稿を非公開にする"}
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 11, color: "#9ca3af" }}>
          日時: {r.createdAt ? new Date(r.createdAt).toLocaleString() : "(不明)"}
        </div>

        <span
          style={{
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 999,
            border: "1px solid",
            whiteSpace: "nowrap",
            ...meta.style,
          }}
        >
          {meta.text}
        </span>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button
          type="button"
          disabled={done || busy}
          onClick={() => onResolve(r.id, "reviewed")}
          className="btn btn-primary btn-sm"
          title={done ? "既に対応済み/却下済みです" : undefined}
          style={done || busy ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
        >
          {reportBusy ? "更新中…" : "対応済みにする"}
        </button>

        <button
          type="button"
          disabled={done || busy}
          onClick={() => onResolve(r.id, "dismissed")}
          className="btn btn-outline btn-sm"
          title={done ? "既に対応済み/却下済みです" : undefined}
          style={done || busy ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
        >
          {reportBusy ? "更新中…" : "却下"}
        </button>
      </div>
    </div>
  );
}
