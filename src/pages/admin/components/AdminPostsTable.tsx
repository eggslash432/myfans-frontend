// front/src/pages/admin/components/AdminPostsTable.tsx

import type { AdminPost } from "@/shared";
import { StatusBadge } from "@/components";
import { 
  creatorLabel, 
  normalizeStatus, 
  statusLabel, 
  toPostBadgeStatus, 
  type SortKey 
} from "../domain/adminPostsView";

export function AdminPostsTable(props: {
  viewList: AdminPost[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  toggleSort: (key: SortKey, defaultDir?: "asc" | "desc") => void;
  onUpdateStatus: (id: string, next: "draft" | "published" | "private", label: string) => void;
  onDelete: (id: string) => void;
  onOpenReports: (postId: string) => void;
}) {
  const { viewList, sortKey, sortDir, toggleSort, onUpdateStatus, onDelete, onOpenReports } = props;

  const sortMark = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className="admin-only-desktop admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 220 }}>投稿ID</th>

            <th style={{ width: 140, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("createdAt", "desc")}>
              作成日{sortMark("createdAt")}
            </th>

            <th style={{ width: 140, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("publishedAt", "desc")}>
              公開日{sortMark("publishedAt")}
            </th>

            <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("title", "asc")}>
              タイトル{sortMark("title")}
            </th>

            <th style={{ width: 140, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("creatorName", "asc")}>
              クリエイター{sortMark("creatorName")}
            </th>

            <th style={{ width: 110, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("status", "desc")}>
              状態{sortMark("status")}
            </th>

            <th style={{ width: 120, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("reportsCount", "desc")}>
              通報{sortMark("reportsCount")}
            </th>

            <th style={{ width: 260 }}>操作</th>
          </tr>
        </thead>

        <tbody>
          {viewList.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ padding: 16, color: "#6b7280" }}>
                投稿がありません。
              </td>
            </tr>
          ) : (
            viewList.map((p) => {
              const st = normalizeStatus((p as any).publishedStatus);
              const id = (p as any).id;

              return (
                <tr key={id}>
                  <td className="admin-id" title={id}>
                    {id}
                  </td>

                  <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 12 }}>
                    {new Date((p as any).createdAt).toLocaleString()}
                  </td>

                  <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 12 }}>
                    {(p as any).publishedAt ? new Date((p as any).publishedAt).toLocaleString() : "-"}
                  </td>

                  <td>
                    <div style={{ fontWeight: 700 }}>{(p as any).title || "（無題）"}</div>
                  </td>

                  <td>{creatorLabel(p)}</td>

                  <td>
                    <StatusBadge status={toPostBadgeStatus(p)} />
                  </td>

                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {(p as any).reportsCount ?? 0}
                  </td>

                  <td>
                    <div className="admin-actions">
                      {st === "published" ? (
                        <button className="btn btn-outline btn-xs" onClick={() => onUpdateStatus(id, "private", statusLabel("private"))}>
                          非公開
                        </button>
                      ) : (
                        <button className="btn btn-outline btn-xs" onClick={() => onUpdateStatus(id, "published", statusLabel("published"))}>
                          公開
                        </button>
                      )}

                      <button className="btn btn-outline btn-xs" onClick={() => onOpenReports(id)}>
                        通報
                      </button>

                      <button className="btn btn-primary btn-xs" onClick={() => onDelete(id)}>
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
