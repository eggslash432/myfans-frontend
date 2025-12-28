// front/src/components/features/admin/AdminPostsCards.tsx

import type { AdminPost } from "@/shared";
import { StatusBadge } from "@/components";
import { 
  creatorLabel, 
  normalizeStatus, 
  postStatusLabel,  
  toPostBadgeStatus 
} from "@/shared";

export function AdminPostsCards(props: {
  viewList: AdminPost[];
  onUpdateStatus: (id: string, next: "draft" | "published" | "private", label: string) => void;
  onDelete: (id: string) => void;
  onOpenReports: (postId: string) => void;
}) {
  const { viewList, onUpdateStatus, onDelete, onOpenReports } = props;

  return (
    <div className="admin-only-mobile admin-cards">
      {viewList.length === 0 ? (
        <section className="card" style={{ background: "#f9fafb" }}>
          <p className="section-subtitle">投稿がありません。</p>
        </section>
      ) : (
        viewList.map((p) => {
          const st = normalizeStatus((p as any).publishedStatus);

          return (
            <div key={(p as any).id} className="admin-post-card">
              <div className="admin-post-title">{(p as any).title || "（無題）"}</div>

              <div className="admin-post-dates text-xs text-gray-500" style={{ marginTop: 4 }}>
                <div>作成日：{new Date((p as any).createdAt).toLocaleString()}</div>
                <div>
                  公開日：
                  {(p as any).publishedAt ? new Date((p as any).publishedAt).toLocaleString() : "-"}
                </div>
              </div>

              <div className="admin-post-meta">
                <span>Creator: {creatorLabel(p)}</span>
                <StatusBadge status={toPostBadgeStatus(p)} />
              </div>

              <div className="admin-post-actions">
                {st === "published" ? (
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() => onUpdateStatus((p as any).id, "private", postStatusLabel("private"))}
                  >
                    非公開
                  </button>
                ) : (
                  <button
                    className="btn btn-outline btn-xs"
                    onClick={() => onUpdateStatus((p as any).id, "published", postStatusLabel("published"))}
                  >
                    公開
                  </button>
                )}

                <button className="btn btn-outline btn-xs" onClick={() => onOpenReports((p as any).id)}>
                  通報
                </button>

                <button className="btn btn-primary btn-xs" onClick={() => onDelete((p as any).id)}>
                  削除
                </button>
              </div>

              <div className="admin-post-idline" title={(p as any).id}>
                ID: {(p as any).id}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
